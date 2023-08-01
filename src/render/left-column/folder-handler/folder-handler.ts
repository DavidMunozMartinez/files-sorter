import { remote } from "electron";
import { FileSorter } from "../../file-sorter";
import { NotificationComponent } from "../../notification-component/notification-component";
import { CategoriesHandler } from "../../right-column/categories-handler/categories-handler";
import { Utils } from "../../utils";
import path from "path";
import { Bind } from "bindrjs";
import { FolderHandlerBind, FolderData } from "./folder-handler.model";

export class FolderHandler {
  categoriesHandler: CategoriesHandler;
  fileSorter: FileSorter;
  notificationService: NotificationComponent;
  utils: Utils;
  folders: { [key:string]: FolderData } = {};

  constructor(
    fileSorter: FileSorter,
    utils: Utils,
    notificationService: NotificationComponent
  ) {
    let folders: { [key:string]: FolderData } = utils.getLocalStorageFolders();
    let bindFolders: FolderData[] = Object.keys(folders).map((key: string) => {
      fileSorter.addWatcher(folders[key].name);
      folders[key].name = key;
      return folders[key];
    });

    const { bind } = new Bind<FolderHandlerBind>({
      id: "folder-handler",
      template: require("./folder-handler.html"),
      bind: {
        selected: '',
        folders: bindFolders,
        dragging: false,
        showTip: true,
        sortFolder: (folder: FolderData) => {
          this.sortFolder(folder.name);
          if (bind.selected === folder.name) {
            this.categoriesHandler.bind.reload();
            console.log('active folder sorted');
          }
        },
        toggleFolderWatcher: (event: MouseEvent, folder: FolderData) => {
          if (folders[folder.name]) {
            folder.active = !folder.active;

            folders[folder.name].active = folder.active;
            localStorage.setItem("folders", JSON.stringify(folders));
            fileSorter.updateFoldersData();
          }
          event.stopImmediatePropagation();
        },
        selectFolder: (folder: FolderData) => {
          if (folder && folder.name) {
            bind.selected = folder.name;
            this.categoriesHandler.enable(folder.name);
            bind.showTip = false;
          }
        },
        removeFolder: (folder: any) => {
          const value = folder.name;
          if (value) {
            this.delete(value);
          }
          let index = bind.folders.indexOf(folder);
          bind.folders.splice(index ,1);
          if (bind.folders.length === 0) {
            this.categoriesHandler.disable();
            bind.showTip = true;
          } else if (value) {
            if (bind.folders[index]) {
              bind.selectFolder(bind.folders[index]);
            } else {
              bind.selectFolder(bind.folders[index - 1]);
            }
          }
          event?.stopImmediatePropagation();
        },
        openFolderDialog: async () => {
          const path = await remote.dialog.showOpenDialog({
            properties: ["openDirectory"],
          });
          const value = path.filePaths[0];
          if (!value) return;
          if (this.save(value)) {
            let newFolder = this.newFolder(value);
            bind.folders.push(newFolder);
            bind.selectFolder(newFolder);
            fileSorter.addWatcher(value);
          } else {
            bind.selected = value;
            this.categoriesHandler.enable(value);
          }
        },
        showFoldersHelp: () => {
          this.notificationService.showConsecutiveTips([
            "FOLDERS_TIP",
            "AUTO_SORT_ON_OFF",
            "MANUAL_SORT",
            "REMOVE_CONFIG",
          ]);
        },
        onDragOver: (event: DragEvent) => {
          bind.dragging = true;
          event.preventDefault();
        },
        onDrop: () => {
          if (this.categoriesHandler.folder && this.categoriesHandler.dragging) {
            let folder = path.resolve(
              this.categoriesHandler.folder,
              this.categoriesHandler.dragging
            );
            if (this.save(folder)) {
              bind.folders.push(this.newFolder(folder));
              bind.selected = folder;
              fileSorter.addWatcher(folder);
            }
          }
          bind.dragging = false;
        },
      },
      ready: () => {
        bind.selectFolder(bindFolders[0]);
      }
    });

    // Handles all logic related to the categories section
    this.categoriesHandler = new CategoriesHandler(
      fileSorter,
      utils,
      notificationService
    );

    
    this.fileSorter = fileSorter;
    fileSorter.onChange((folder) => {
      if (bind.selected === folder) {
        this.categoriesHandler.bind.reload();
      }
    });
    this.notificationService = notificationService;
    this.utils = utils;
  }

  private newFolder(name: string): FolderData {
    return {
      name: name,
      active: false,
      categories: {},
      order: [],
    };
  }

  /**
   * Deletes all stored data related to a specific folder
   * @param folder Folder string path to delete from storage
   */
  private delete(folder: string) {
    const data: any = this.utils.getLocalStorageFolders();
    if (data && data[folder]) {
      delete data[folder];
      localStorage.setItem("folders", JSON.stringify(data));
      this.fileSorter.deleteWatcher(folder);
      this.fileSorter.updateFoldersData();
    }
  }

  /**
   * Stores folder path in local storage, onlu if its not already there
   * @param folder Folder path string to store
   */
  private save(folder: string): boolean {
    const data: any = this.utils.getLocalStorageFolders();
    let success = false;
    if (!data[folder]) {
      data[folder] = {
        name: folder,
        categories: {},
        active: false,
        order: [],
      };
      localStorage.setItem("folders", JSON.stringify(data));
      this.fileSorter.updateFoldersData();
      success = true;
    }
    return success;
  }

  private sortFolder(folder: string, done?: () => void) {
    this.fileSorter
      .sortFolder(folder)
      .then((movedFiles) => {
        this.notificationService.notifyFileMove(folder, movedFiles);
      })
      .catch((err) => {
        if (err.indexOf("timeout") > -1) {
          let message = `Timeout limit exceeded while sorting ${folder}`;
          this.notificationService.notify({
            timer: 6000,
            message: message,
            type: "error",
          });
          this.notificationService.notifyOS("Sorting time out", message);
        }
      })
      .finally(() => {
        if (done) done();
      });
  }
}
