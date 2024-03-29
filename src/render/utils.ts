import { exec } from "child_process";
import { shell } from "electron";
import path from "path";
import fs from "fs";

export class Utils {
  closest(element: HTMLElement, selector: string): HTMLElement | null {
    let match = null;

    if (element.parentElement && element.parentNode?.nodeName !== "document") {
      match = element.parentElement.matches(selector)
        ? element.parentElement
        : this.closest(element.parentElement, selector);

      return match;
    } else {
      return null;
    }
  }

  fsDropdown(element: HTMLElement | Element) {
    element.addEventListener("click", (event: any) => {
      onClick(event);
    });

    const onClick = (event: any) => {
      if (event.target.classList.contains("dropdown")) {
        event.target.classList.toggle("expanded");
      } else if (event.target.nodeName === "SPAN") {
        const container = this.closest(event.target, ".dropdown");
        const key = event.target.getAttribute("value");
        if (container) {
          const valueHolder = container?.querySelector(".value");
          container.setAttribute("value", key);
          if (valueHolder) {
            valueHolder.innerHTML = event.target.innerHTML;
            container.blur();
          }
        }
      }
    };
  }

  saveData(key: string, data: any) {
    let rawData = JSON.stringify(data);
    localStorage.setItem(key, rawData);
  }

  getData(key: string) {
    const raw: string | null = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  }

  removeData() {}

  revealInExplorer(pathString: string, select?: boolean) {
    if (select) {
      shell.showItemInFolder(pathString);
    } else {
      shell.openPath(pathString);
    }
  }

  getOpenCommandLine() {
    switch (process.platform) {
      case "darwin":
        return "open";
      case "win32":
        return "start";
      default:
        return "xdg-open";
    }
  }

  getShowCommand() {
    switch (process.platform) {
      case "darwin":
        return "open";
      case "win32":
        return "explorer";
      default:
        return "xdg-open";
    }
  }

  readLogs() {
    if (!fs.existsSync("./logs.txt")) {
      return;
    }

    exec(this.getOpenCommandLine() + " " + path.resolve("./logs.txt"));
  }

  async getDirectories(source: any): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(source, { withFileTypes: true }, (err, dirents) => {
        if (!dirents) {
          return resolve(dirents);
        }
        let result = dirents
          .filter(
            (dirent) =>
              dirent.isDirectory() &&
              dirent.name.indexOf(".app") !== dirent.name.length - ".app".length
          )
          .map((dirent) => dirent.name);
        resolve(result);
      });
    });
  }

  /**
   * Returns all sotred data from folders
   */
  getLocalStorageFolders(): any {
    let data = {};
    const raw: string | null = localStorage.getItem("folders");
    if (raw) {
      data = JSON.parse(raw);
    }
    return data;
  }

    /**
   * Returns all sotred data from folders
   */
  getFolders(): any {
    let data = {};
    const raw: string | null = localStorage.getItem("folders");
    if (raw) {
      data = JSON.parse(raw);
    }
    return data;
  }
  
  /**
   * Returns the defined categories for a specified folder path
   * @param folder Folder path to get defined categories from
   */
  getCategories(folder: string): any {
    const folders = this.getFolders();
    let categories = [];
    const data = folders[folder];
    if (data && data.categories) {
      categories = data.categories;
    }

    return categories;
  }
  
  /**
   * Retuns the list of extensions that are defined for the given folder path and category
   * @param folder Folder path string
   * @param category Category name to get the extensions from
   */
  getExtensions(folder: string, category: string): any {
    const categories: any = this.getCategories(folder);
    let extensions: any[] = [];
    if (categories && categories[category]) {
      extensions = categories[category];
    }

    return extensions;
  }

  isActualFile(fullpath: string, fileName: string): boolean {
    const stats = fs.statSync(fullpath);
    return stats.isFile() && fileName.charAt(0) !== '.';
  }
}
