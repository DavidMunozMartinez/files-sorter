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
    this.currentTheme = this.getSystemTheme();
    this.notification = this.utils.getData("notifications") || false;
    this.applyTheme(this.currentTheme);
    this.renderer = new Renderer({
      id: "nav-bar-component",
      template: require("./nav-bar-component.html"),
      bind: {
        theme: this.currentTheme,
        notification: this.notification,
      },
    });
    this.bind = this.renderer.bind;

    const themeToggle =
      this.renderer.container?.getElementsByClassName("theme-toggle")[0];
    const notificationToggle = this.renderer.container?.getElementsByClassName(
      "notifications-toggle"
    )[0];

    themeToggle?.addEventListener("click", () => {
      let theme: themes = this.currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(theme);
      this.bind.themeIcon = theme;
      this.utils.saveData("theme", theme);
    });

    notificationToggle?.addEventListener("click", () => {
      this.notification = !this.notification;
      this.bind.notification = this.notification;
      this.utils.saveData("notifications", this.notification);

      this.notificationService.notify({
        message:
          "OS notifications turned " + (this.notification ? "on" : "off"),
        type: "info",
        timer: 5000,
      });
    });

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
