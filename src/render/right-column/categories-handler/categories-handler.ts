import { FileSorter } from "../../file-sorter";
import { RulesHandler } from "../rules-handler/rules-handler";
import { Utils } from "../../utils";
import path from "path";
import { NotificationComponent } from "../../notification-component/notification-component";
import fs from "fs";
import { Bind } from "bindrjs";

export class CategoriesHandler {
  folder: string | null = null;
  extensionHandler: RulesHandler;
  fileSorter: FileSorter;
  utils: Utils;
  notificationService: NotificationComponent;
  dragging: string | null = null;
  activeCategory: string | null = null;

  renderer;

  constructor(
    fileSorter: FileSorter,
    utils: Utils,
    notificationService: NotificationComponent
  ) {
    this.renderer = new Bind<any>({
      id: 'categories-handler',
      template: require('./categories-handler.html'),
      bind: {
        activeFolder: null,
        looseFiles: null,
        searchTerm: '',
        showOverlay: true,
        categoryData: {},
      },
      onChange: () => {
        console.log();
      }
    });

    this.fileSorter = fileSorter;
    this.utils = utils;
    this.notificationService = notificationService;
    this.extensionHandler = new RulesHandler(
      fileSorter,
      utils,
      notificationService
    );

    this.renderer.bind.openPath = () => {
      let fullPath = path.resolve(this.renderer.bind.activeFolder);
      this.utils.revealInExplorer(fullPath);
    }
    this.renderer.bind.reload = () => {
      let active = this.folder;
      this.disable();
      setTimeout(() => {
        if (active) {
          this.enable(active);
        }
      }, 200);
    }

    this.renderer.bind.delete = (category: string) => {
      this.delete(category)
    };

    this.renderer.bind.onInputKeydown = (event: any) => {
      if (event.which === 13) this.onEnter(event);
    }

    this.renderer.bind.onDblclick = (category: string) => {
      let fullPath = path.resolve(this.folder || "", category);
      this.utils.revealInExplorer(fullPath);
    }

    this.renderer.bind.select = (category: string) => {
      if (this.folder && category) {
        this.extensionHandler.enable(this.folder, category);
        this.renderer.bind.activeCategory = category;
        this.activeCategory = category;
      }
    }

    this.renderer.bind.expandCategory = (category: string) => {
      // TODO: fix bug in bindjr
      let copy = { ...this.renderer.bind.categoryData };
      copy[category].expanded = !copy[category].expanded;
      this.renderer.bind.categoryData = copy;
    }
  }

  /**
   * Enables the category section with the given folder string
   * @param folder Folder string path
   */
  enable(folder: string) {
    if (this.folder === folder) {
      return;
    }

    this.utils.getDirectories(folder).then((categories: string[]) => {
      this.renderer.bind.categoryData = {};
      this.renderer.bind.showOverlay = false;
      this.folder = folder;
      this.renderer.bind.categories = [];
      let data = this.utils.getLocalStorageFolders();
      categories.forEach((category: string) => {
        if (
          this.folder &&
          data[this.folder] &&
          !data[this.folder].categories[category]
        ) {
          this.save(category);
        }
      });
      data = this.utils.getLocalStorageFolders();
      let order: string[] = data[this.folder].order;
      this.renderer.bind.activeFolder = folder;

      fs.readdir(folder, (err, contents) => {
        let files = contents
          .filter(content => {
            const stats: fs.Stats = fs.statSync(path.resolve(folder, content));
            const isFile = stats.isFile();
            return isFile && content.charAt(0) !== '.';
          });
        
        this.renderer.bind.looseFiles = `${files.length} loose files`
      });

      // If the category list is greater than 0 we render it and remove the section tip
      if (categories.length > 0) {
        order = this.cleanUpFolderOrder(order, categories)
        // Use the defined order if exists
        this.renderer.bind.categories = (order.length ? order : categories);
        this.renderer.bind.showTip = false;
        categories.forEach((category: string) => {
          const content = fs.readdirSync(path.resolve(folder, category));
          this.renderer.bind.categoryData[category] = {
            files: content,
            expanded: false,
          };
        });
        console.log(this.renderer.bind.categoryData);
        // If not, the section is enabled but we show the tip
      } else {
        this.renderer.bind.showOverlay = false;
        this.renderer.bind.showTip = true;
        this.extensionHandler.clear();
        this.extensionHandler.disable();
      }
    });
  }

  /**
   * Disables the categories section by showing the overlay and hiding the tip
   * it also sets folder to null and clears and disables the extensions section
   */
  disable() {
    this.renderer.bind.showTip = false;
    this.renderer.bind.showOverlay = true;
    this.folder = null;
    this.extensionHandler.clear();
    this.extensionHandler.disable();
  }

  /**
   * Executed when the enter key is pressed on the section input
   * @param event Native DOM event
   */
  private onEnter(event: any) {
    if (!this.folder) {
      return;
    }
    const value = event.target.innerText;
    let destination = path.resolve(this.folder, value);
    fs.mkdir(destination, (err) => {
      if (err) {
        let alreadyExists = err.message.indexOf('EEXIST') > -1;
        let message = 'Oops, something went wrong'
        if (alreadyExists) {
          message = `Folder "${value}" already exists`;
        }
        this.notificationService.notify({
          message: message,
          type: "error",
          timer: 0,
        });
        return;
      }
      if (this.save(value)) {
        event.target.innerText = "";
        this.renderer.bind.categories.unshift(value);
        this.renderer.bind.select(value);
        this.notificationService.showTipIfNeeded("REORDER_CATEGORIES");
      }
    });
    event.preventDefault();
  }

  /**
   * Saves in local storage a category string on the current active folder
   * @param category Category string to save
   */
  private save(category: string) {
    if (!this.folder || category === "") {
      return false;
    }
    let success = false;
    const folders = this.utils.getLocalStorageFolders();
    const folder = folders[this.folder];
    const categories = folder.categories;

    if (!categories[category]) {
      categories[category] = [];
      folder.order.push(category);
      localStorage.setItem("folders", JSON.stringify(folders));
      this.fileSorter.updateFoldersData();
      success = true;
    }

    return success;
  }

  /**
   * Deletes the category and its data from local storage
   * @param category Category string to delete
   */
  private delete(category: string) {
    if (!this.folder) {
      return;
    }

    const folders = this.utils.getLocalStorageFolders();
    const folder: {
      order: string[];
      categories: any;
    } = folders[this.folder];

    if (folder.categories && folder.categories[category]) {
      delete folder.categories[category];
    }

    const orderIndex = folder.order.indexOf(category);
    const RenderIndex = this.renderer.bind.categories.indexOf(category);
    if (folder.order && folder.order.length > 0 && orderIndex > -1) {
      folder.order.splice(orderIndex, 1);
    }

    if (RenderIndex > -1) {
      this.renderer.bind.categories.splice(RenderIndex, 1);
    }

    localStorage.setItem("folders", JSON.stringify(folders));
    this.fileSorter.updateFoldersData();
  }

  private cleanUpFolderOrder(savedOrder: string[], foundCategories: string[]) {
    return savedOrder.filter((category) => {
      return foundCategories.indexOf(category) > -1;
    });

  }
}
