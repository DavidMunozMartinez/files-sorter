import { FileSorter } from "./file-sorter";
import { FolderHandler } from "./left-column/folder-handler/folder-handler";
import { Utils } from "./utils";
import { NotificationComponent } from "./notification-component/notification-component";

import "smart-hoverjs";
import "chokidar";
import { NavBar } from "./left-column/nav-bar/nav-bar-component";
class App {
  // Utilities instance
  private utils: Utils = new Utils();
  // Handles rendering app notifications
  private notificationService = new NotificationComponent(this.utils);
  // Handles all logic to actually sort and move files around
  private fileSorter: FileSorter = new FileSorter(
    this.notificationService,
    this.utils
  );

  private navBar: NavBar = new NavBar(
    this.utils,
    this.notificationService
  );

  // Handles all logic around storing data and rendering the folders in the view
  private folderHandler: FolderHandler = new FolderHandler(
    this.fileSorter,
    this.utils,
    this.notificationService
  );

  constructor() {
    this.folderHandler.on("removed", (item: HTMLElement) => {
      const valueHolder = item.querySelector(".value-holder");
      const folder = valueHolder?.innerHTML;
      if (folder) {
        this.fileSorter.deleteWatcher(folder);
      }
    });

    this.folderHandler.on("added", (item: HTMLElement) => {
      const valueHolder = item.querySelector(".value-holder");
      const folder = valueHolder?.innerHTML;
      if (folder) {
        this.fileSorter.addWatcher(folder);
      }
    });

    const folders = Object.keys(this.folderHandler.getFolders());
    const items: HTMLElement[] = folders.map((folder) => {
      return this.folderHandler.createListElement(folder);
    });

    if (items.length > 0) {
      this.folderHandler.renderList(items, 0);
    } else {
      this.folderHandler.showTip();
    }
  }
}

const app = new App();
