import { FileSorter } from "./file-sorter";
import { FolderHandler } from "./left-column/folder-handler/folder-handler";
import { Utils } from "./utils";
import { NotificationComponent } from "./notification-component/notification-component";
import "smart-hoverjs";
import "chokidar";
import { NavBar } from "./left-column/nav-bar/nav-bar-component";

class App {
  private utils: Utils = new Utils();
  private notificationService = new NotificationComponent(this.utils);
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

  constructor() {}
}

const app = new App();
