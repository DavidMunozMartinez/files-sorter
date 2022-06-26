import { FileSorter } from "./file-sorter";
import { FolderHandler } from "./left-column/folder-handler";
import { Utils } from "./utils";
import { NotificationComponent } from "./notification-component/notification-component";
import "smart-hoverjs";
import "chokidar";
class App {
  // let not = new Notification('NOTIFICATION_TITLE', { body: 'NOTIFICATION_BODY' });
  // Utilities instance
  private utils: Utils = new Utils();
  // Handles rendering app notifications
  private notificationService = new NotificationComponent(this.utils);
  // Handles all logic to actually sort and move files around
  private fileSorter: FileSorter = new FileSorter(this.notificationService, this.utils);

  public currentTheme: 'dark' | 'light' = this.getSystemTheme();
  public notifications: boolean = this.utils.getData('notifications') || false;

  // Handles all logic around storing data and rendering the folders in the view
  private folderHandler: FolderHandler = new FolderHandler(
    this.fileSorter,
    this.utils,
    this.notificationService
  );

  constructor() {
    this.setSettings();
    this.applyTheme(this.currentTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      let userSetting: 'dark' | 'light' | null = this.utils.getData('theme');
      if (!userSetting) {
        this.applyTheme(this.getSystemTheme());
      }
    });

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

  private getSystemTheme(): 'dark' | 'light' {
    let userSetting: 'dark' | 'light' | null = this.utils.getData('theme');
    if (userSetting) {
      return userSetting;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ?
      'dark' : 'light';
  }

  private applyTheme(theme: 'dark' | 'light') {
    switch (theme) {
      case 'dark':
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        break;
      case 'light':
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        break;
    }
    this.currentTheme = theme;
    const navBar = window.document.getElementsByClassName('nav-bar')[0];
    const themeToggle = navBar.getElementsByClassName('input-container theme-toggle')[0];
    let icon = themeToggle.getElementsByTagName('i')[0];
    icon.innerHTML = this.currentTheme  + '_mode'
  }

  private setSettings() {
    const navBar = window.document.getElementsByClassName('nav-bar')[0];
    const themeToggle = navBar.getElementsByClassName('input-container theme-toggle')[0];
    const notificationsToggle = navBar.getElementsByClassName('input-container notifications-toggle')[0];
    const logsToggle = navBar.getElementsByClassName('input-container logs-viewer')[0]
    const notificationState = this.utils.getData('notifications');
    const notificationIcon = notificationsToggle.getElementsByTagName('i')[0];
    notificationIcon.innerHTML = notificationState ? 'notifications' : 'notifications_off';

    themeToggle.addEventListener('click', (event) => {
      let themeToApply: 'dark' | 'light' = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(themeToApply);  
      let icon = themeToggle.getElementsByTagName('i')[0];
      icon.innerHTML = themeToApply + '_mode';
      this.utils.saveData('theme', themeToApply);
    });

    notificationsToggle.addEventListener('click', (event) => {
      let icon = notificationsToggle.getElementsByTagName('i')[0];
      this.notifications = !this.notifications
      this.notifications ? icon.innerHTML = 'notifications' : icon.innerHTML = 'notifications_off';
      this.utils.saveData('notifications', this.notifications);
    });

    logsToggle.addEventListener('click', () => {
      this.utils.readLogs();
    });
  }
}

const app = new App();
