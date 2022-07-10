import { Renderer } from "../../app-renderer";
import { NotificationComponent } from "../../notification-component/notification-component";
import { Utils } from "../../utils";
import axios from "axios";

type themes = "dark" | "light";

export class NavBar {
  renderer!: Renderer;
  utils: Utils;
  notificationService: NotificationComponent;
  currentTheme!: themes;
  notification: boolean = false;
  versionCheckUrl: string = "";

  private bind!: any;

  constructor(utils: Utils, notificationService: NotificationComponent) {
    this.utils = utils;
    this.notificationService = notificationService;

    this.renderer = new Renderer({
      id: "nav-bar-component",
      template: require("./nav-bar-component.html"),
      bind: {
        theme: this.getSystemTheme(),
        notification: this.utils.getData("notifications") || false,
        settingsEnabled: false,
        checkingForUpdatesClass: '',
        toggleTheme: () => {
          this.bind.theme = this.bind.theme === "dark" ? "light" : "dark";
          this.applyTheme(this.bind.theme);
          this.utils.saveData("theme", this.bind.theme);
        },
        toggleNotification: () => {
          this.bind.notification = !this.bind.notification;
          this.utils.saveData("notifications", this.bind.notification);

        },
        checkForUpdates: () => {
          let current = process.env.npm_package_version;
          this.bind.checkingForUpdates = 'checking';
          axios
            .get(
              "https://api.github.com/repos/DavidMunozMartinez/files-sorter/releases/latest"
            )
            .then((result: any) => {
              let latest = result.data.name;
              let message = "";
              let timer = 0;
              if (latest.indexOf(current) === -1) {
                let appFile =
                  process.platform === "darwin"
                    ? "file-sorter-" + latest + ".dmg"
                    : "file-sorter." + latest + ".exe";
                let asset = result.data.assets.filter(
                  (asset: any) => asset.name === appFile
                )[0];
                let url = asset.browser_download_url;
                message = `
                  There is a new(${latest}) version available!
                  <a href="${url}">Download</a>
                `;
                timer = 10000;
              } else {
                (message = `You are using the latest version! \n (${current})`),
                  (timer = 5000);
              }
              this.notificationService.notify({
                message: message,
                type: "info",
                timer: timer,
              });
            }).finally(() => {
              this.bind.checkingForUpdates = '';
            });
        },
      },
    });
    this.bind = this.renderer.bind;
    this.applyTheme(this.bind.theme);

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        let userSetting: "dark" | "light" | null = this.utils.getData("theme");
        if (!userSetting) {
          this.applyTheme(this.getSystemTheme());
        }
      });
  }

  private getSystemTheme(): "dark" | "light" {
    let userSetting: "dark" | "light" | null = this.utils.getData("theme");
    if (userSetting) {
      return userSetting;
    }
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  private applyTheme(theme: "dark" | "light") {
    switch (theme) {
      case "dark":
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        break;
      case "light":
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        break;
    }
    this.currentTheme = theme;
  }
}
