import chokidar from "chokidar";
import path from "path";
import * as fs from "fs";
import { spawn, exec } from "child_process";
import { NotificationComponent } from "./notification-component/notification-component";
import { Utils } from "./utils";

export interface IMovedFileData {
  from: string;
  to: string;
  fileName: string;
}

export class FileSorter {
  private paths: any;
  private onChangeDetected: ((folder: string) => void)[] = [];
  private defaultConfig = {
    persistent: true,
    depth: 0,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100,
    },
    ignoreInitial: true,
  };
  watchers: any = {};
  moveHistory = [];
  notificationService: NotificationComponent;
  utils: Utils;

  constructor(notificationService: NotificationComponent, utils: Utils) {
    this.notificationService = notificationService;
    this.utils = utils;
    this.updateFoldersData();
  }

  /**
   * Updates local variable (this.paths) holding pre-processed folder data, data is pre-processed
   * and constantly updated to avoid lookup times when searching the right location for a new file
   */
  updateFoldersData(data?: any) {
    if (!data) {
      const raw: string | null = localStorage.getItem("folders");
      if (raw) data = JSON.parse(raw);
    }
    this.paths = data;
  }

  /**
   * Adds a new chokidar watcher to the watchers object, each watcher triggers an event when a new file is detected
   * @param folder folder that will be observer
   */
  addWatcher(folder: string) {
    const watcher = chokidar.watch(folder, this.defaultConfig);
    watcher.on("add", (location: any) => {
      if (this.paths[folder].active) {
        this.sort(folder, location).then((moved) => {
          if (moved) {
            this.notificationService.notifyFileMove(folder, [moved]);
          }
        });
      }
    });
    watcher.on("all", () => {
      this.onChangeDetected.forEach((fn) => fn(folder));
    })
    this.watchers[folder] = watcher;
  }

  onChange(fn: (folder: string) => void) {
    this.onChangeDetected.push(fn);
  }

  /**
   * Closes the chokidar watcher and deletes it from the watchers object
   * @param folder folder that will be deleted
   */
  deleteWatcher(folder: string) {
    if (!this.watchers[folder]) {
      return;
    }

    this.watchers[folder].close();
    delete this.watchers[folder];
  }

  /**
   * Reads all contents of a given folder path and applies its sorting rules to each file
   * @param folder Folder that will be sorted
   */
  sortFolder(folder: string): Promise<IMovedFileData[]> {
    let movedFiles: IMovedFileData[] = [];
    return new Promise((resolve, reject) => {
      let timeoutId = setTimeout(() => {
        reject("timeout");
      }, 1000 * 10);

      fs.readdir(folder, { withFileTypes: true }, (err, dirents) => {
        if (err) return reject(err);
        let solved = 0;
        dirents.forEach((dirent) => {
          if (dirent.isFile()) {
            this.sort(folder, path.resolve(folder, dirent.name)).then(
              (movedData) => {
                solved++;
                if (movedData) movedFiles.push(movedData);
                if (solved === dirents.length) {
                  resolve(movedFiles);
                  clearTimeout(timeoutId);
                }
              }
            );
          } else {
            solved++;
            if (solved === dirents.length) {
              resolve(movedFiles);
              clearTimeout(timeoutId);
            }
          }
        });
        if (!dirents.length) {
          resolve([]);
          clearTimeout(timeoutId);
        }
      });
    });
  }

  /**
   * Executed when a new file is detected by a watcher, it makes sure to pick the right
   * plae for the new detected file and moves it to a constructed location based on the
   * folder rules
   * @param folder Path that triggered the sort action
   * @param location Absolute location for the file
   */
  private async sort(folder: string, location: string): Promise<IMovedFileData | null> {
    const data = this.paths[folder];
    const name: any = path.basename(location);
    const category = this.getCategory(data, name);
    let moved = null;

    if (!category) {
      return null;
    }

    let destination = path.resolve(folder, category);
    if (!destination) {
      return null;
    }

    if (!fs.existsSync(destination)) {
      await fs.mkdirSync(destination);
    }

    destination = await this.validateDestination(destination, name);
    if (
      fs.existsSync(location) &&
      destination.toLocaleLowerCase() !== location.toLocaleLowerCase()
    ) {
      await fs.renameSync(location, destination);
      moved = {
        from: location,
        to: destination,
        fileName: name,
      };
      this.logToFile(moved);
    }

    return moved;
  }

  /**
   * Makes sure, if the file name already exists in the destination, renames the new file by adding
   * a number (starting from 1) and incrementally do this until the file name is unique to its destination
   * @param destination Destination to move the file
   * @param name File name (including extension)
   */
  private async validateDestination(
    destination: string,
    name: string
  ): Promise<string> {
    const split = this.splitExtension(name);
    const fileName = split[0];
    const extension = split[1];

    let possible = path.resolve(destination, name);
    let exists = await fs.existsSync(possible);
    let increment = 1;
    while (exists) {
      const newName = `${fileName} (${increment}).${extension}`;
      possible = path.resolve(destination, newName);
      exists = await fs.existsSync(possible);
      increment += 1;
    }
    return possible;
  }

  /**
   * Splits the file into name and extension, taking into account scenarios where files contain dots in
   * their names
   * @param fileName File name (including extension)
   */
  private splitExtension(fileName: string): string[] {
    const split = fileName.split(".");
    let name = "";
    let extension = "";

    for (let i = 0; i <= split.length - 2; i++) {
      name += split[i];
      if (i + 1 <= split.length - 2) {
        name += ".";
      }
    }

    extension = split[split.length - 1];

    return [name, extension];
  }

  private getCategory(data: any, fileName: string): string | null {
    const categories = data.categories;
    const order = data.order;
    let found = false;
    let category = null;

    for (let i = 0; i < order.length; i++) {
      const conditionStrings = categories[order[i]];
      for (let j = 0; j < conditionStrings.length; j++) {
        const conditionString = conditionStrings[j];
        if (this.checkConditionString(conditionString, fileName)) {
          found = true;
          category = order[i];
          break;
        }
      }
      if (found) {
        break;
      }
    }
    return category;
  }

  private checkConditionString(
    conditionString: string,
    fileName: string
  ): boolean {
    let isGrouped = conditionString.indexOf(",") > -1;
    let result = false;
    if (isGrouped) {
      result = this.checkGroupedRule(conditionString, fileName);
    } else {
      result = this.checkSingleRule(conditionString, fileName);
    }

    return result;
  }

  private checkSingleRule(conditionString: string, fileName: string): boolean {
    let result = false;
    const split = conditionString.split(":");
    const condition = split[0];
    const value = split[1];

    switch (condition) {
      case "starts_with":
        result = fileName.indexOf(value) === 0;
        break;
      case "contains":
        result = fileName.indexOf(value) > -1;
        break;
      case "ends_with":
        result = fileName.indexOf(value) === fileName.length - value.length;
        break;
    }

    return result;
  }

  private checkGroupedRule(conditionString: string, fileName: string): boolean {
    let conditions = conditionString.split(",");
    let validCount = 0;
    conditions.forEach((condition) => {
      if (this.checkSingleRule(condition, fileName)) validCount++;
    });
    return validCount === conditions.length;
  }

  private revealInExplorer(pathString: string) {
    spawn("explorer", [`/select, "${pathString}"`], { shell: true });
  }

  private logToFile(data: any) {
    if (!fs.existsSync("./logs.txt")) {
      fs.writeFileSync("./logs.txt", "");
    }
    let value = JSON.stringify(data);
    fs.appendFileSync(
      "./logs.txt",
      new Date().toLocaleString() + ": " + value + "\n"
    );
  }
}
