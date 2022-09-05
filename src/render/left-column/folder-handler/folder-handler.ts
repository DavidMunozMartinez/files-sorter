import { remote } from "electron";
import { FileSorter, IMovedFileData } from "../../file-sorter";
import { NotificationComponent } from "../../notification-component/notification-component";
import { CategoriesHandler } from "../../right-column/categories-handler/categories-handler";
import { Utils } from "../../utils";
import path from "path";
import { Bind } from "bindrjs";

export class FolderHandler {
  categoriesHandler: CategoriesHandler;
  fileSorter: FileSorter;
  notificationService: NotificationComponent;
  utils: Utils;
  listReady: boolean = false;
  folders: { [key: string]: HTMLElement } = {};
  foldersData: any;

  constructor(
    fileSorter: FileSorter,
    utils: Utils,
    notificationService: NotificationComponent
  ) {
    let folders = utils.getLocalStorageFolders();
    let bindFolders = Object.keys(folders).map((key: string) => {
      fileSorter.addWatcher(folders[key].name);
      folders[key].name = key;
      return folders[key];
    });

    const FolderHandlerBinds: any = new Bind({
      id: "folder-handler",
      template: require("./folder-handler.html"),
      bind: {
        selected: null,
        folders: bindFolders,
        dragging: false,
        showTip: true,
        sortFolder: (folder: any) => this.sortFolder(folder.name),
        toggleFolderWatcher: (event: any, folder: any) => {
          if (folders[folder.name]) {
            folder.active = !folder.active;

            folders[folder.name].active = folder.active;
            localStorage.setItem("folders", JSON.stringify(folders));
            this.fileSorter.updateFoldersData();
          }
          event.stopImmediatePropagation();
        },
        selectFolder: (folder: any) => {
          if (folder && folder.name) {
            FolderHandlerBinds.bind.selected = folder.name;
            this.categoriesHandler.enable(folder.name);
            FolderHandlerBinds.bind.showTip = false;
          }
        },
        removeFolder: (folder: any) => {
          const value = folder.name;
          if (value) {
            this.delete(value);
          }
          let index = FolderHandlerBinds.bind.folders.indexOf(folder);
          FolderHandlerBinds.bind.folders.splice(index ,1);
          if (FolderHandlerBinds.bind.folders.length === 0) {
            this.categoriesHandler.disable();
            FolderHandlerBinds.bind.showTip = true;
          } else if (value) {
            if (FolderHandlerBinds.bind.folders[index]) {
              FolderHandlerBinds.bind.selectFolder(FolderHandlerBinds.bind.folders[index]);
            } else {
              FolderHandlerBinds.bind.selectFolder(FolderHandlerBinds.bind.folders[index - 1]);
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
            FolderHandlerBinds.bind.folders.push(newFolder);
            FolderHandlerBinds.bind.selectFolder(newFolder);
            this.fileSorter.addWatcher(value);
          } else {
            FolderHandlerBinds.bind.selected = value;
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
          FolderHandlerBinds.bind.dragging = true;
          event.preventDefault();
        },
        onDrop: () => {
          if (this.categoriesHandler.folder && this.categoriesHandler.dragging) {
            let folder = path.resolve(
              this.categoriesHandler.folder,
              this.categoriesHandler.dragging
            );
            if (this.save(folder)) {
              FolderHandlerBinds.bind.folders.push(this.newFolder(folder));
              FolderHandlerBinds.bind.selected = folder;
              this.fileSorter.addWatcher(folder);
            }
          }
          FolderHandlerBinds.bind.dragging = false;
        },
      },
      ready: () => {
        FolderHandlerBinds.bind.selectFolder(bindFolders[0]);
      }
    });

    // Handles all logic related to the categories section
    this.categoriesHandler = new CategoriesHandler(
      fileSorter,
      utils,
      notificationService
    );

    this.fileSorter = fileSorter;
    this.notificationService = notificationService;
    this.utils = utils;
  }

  private newFolder(name: string) {
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
      // delete this.folders[folder];
      localStorage.setItem("folders", JSON.stringify(data));
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
