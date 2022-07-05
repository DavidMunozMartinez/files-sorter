import { Renderer } from "../../app-renderer";
import { NotificationComponent } from "../../notification-component/notification-component";
import { Utils } from "../../utils";

type themes = "dark" | "light";

export class NavBar {
  renderer!: Renderer;
  utils: Utils;
  notificationService: NotificationComponent;
  currentTheme!: "dark" | "light";
  notification: boolean = false;

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
        toggleTheme: () => {
          this.bind.theme = this.bind.theme === "dark" ? "light" : "dark";
          this.applyTheme(this.bind.theme);
          this.utils.saveData("theme", this.bind.notification)
        },
        toggleNotification: (data: any) => {
          console.log(data)
          this.bind.notification = !this.bind.notification;
          this.utils.saveData("notifications", this.bind.notification);
        }
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
