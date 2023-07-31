import { FileSorter } from "../../file-sorter";
import { RulesHandler } from "../rules-handler/rules-handler";
import { Utils } from "../../utils";
import path from "path";
import { NotificationComponent } from "../../notification-component/notification-component";
import fs from "fs";
import { Bind } from "bindrjs";
import { CategoryData, CategoryHandlerBind } from "./categories-handler.model";

export class CategoriesHandler {
  folder: string | null = null;
  extensionHandler: RulesHandler;
  fileSorter: FileSorter;
  utils: Utils;
  notificationService: NotificationComponent;
  dragging: string | null = null;
  renderer: Bind<CategoryHandlerBind>;

  constructor(
    fileSorter: FileSorter,
    utils: Utils,
    notificationService: NotificationComponent
  ) {
    this.fileSorter = fileSorter;
    this.utils = utils;
    this.notificationService = notificationService;
    this.extensionHandler = new RulesHandler(
      fileSorter,
      utils,
      notificationService
    );

    this.renderer = new Bind<CategoryHandlerBind>({
      id: 'categories-handler',
      template: require('./categories-handler.html'),
      bind: {
        categories: [],
        activeCategory: '',
        activeFolder: '',
        looseFiles: '',
        searchTerm: '',
        showOverlay: true,
        showTip: false,
        categoryData: {},
        openPath: () => {
          let fullPath = path.resolve(this.renderer.bind.activeFolder);
          utils.revealInExplorer(fullPath);
        },
        reload: () => {
          let active = this.folder;
          this.disable();
          setTimeout(() => {
            if (active) {
              this.enable(active);
            }
          }, 100);
        },
        delete: (category: string) => {
          this.delete(category)
        },
        onInputKeydown: (event: KeyboardEvent) => {
          if (event.which === 13) this.onEnter(event);
        },
        onSearch: (event: KeyboardEvent) => {
          this.renderer.bind.searchTerm = (event.target as HTMLDivElement).textContent || '';
          if (!this.renderer.bind.searchTerm) {
            this.collapseExpandedSearch();
          }
        },
        onDblclick: (category: string) => {
          let fullPath = path.resolve(this.folder || "", category);
          this.utils.revealInExplorer(fullPath);
        },
        select: (category: string) => {
          if (this.folder && category) {
            this.extensionHandler.enable(this.folder, category);
            this.renderer.bind.activeCategory = category;
          }
        },
        expandCategory: (category: string, prop: 'expanded' | 'searchExpanded') => {
          // TODO: fix this bug in bindjr
          if (this.renderer.bind.categoryData && this.renderer.bind.categoryData[category].files.length) {
            let copy = { ...this.renderer.bind.categoryData };
            copy[category][prop || 'expanded'] = !copy[category][prop || 'expanded'];
            this.renderer.bind.categoryData = copy;
          }
        },
        filterCategory: (category: string) => {
          const value = category.toLowerCase();
          if (!this.renderer.bind.searchTerm) return false;
          const term: string = this.renderer.bind.searchTerm.toLowerCase();
          const categoryPasses = value.indexOf(term) > -1;
          const categoryContent: CategoryData = this.renderer.bind.categoryData[category];
          const categoryContentMatch = categoryContent.files.find((file: string) => file.toLowerCase().indexOf(term) > -1);
          const categoryContentPasses = categoryContent && categoryContent.files && categoryContentMatch;
          if (categoryContentPasses && !categoryContent.searchExpanded) {
            this.renderer.bind.expandCategory(category, 'searchExpanded');
          }
          return Boolean(categoryPasses || categoryContentPasses);
        },
        filterCategoryFile: (file: string) => {
          const value = file.toLowerCase();
          const term: string = this.renderer.bind.searchTerm.toLowerCase();
          return value.indexOf(term) > -1;
        }
      }
    });
  }

  /**
   * Enables the category section with the given folder string
   * @param folder Folder string path
   */
  enable(folder: string) {
    if (this.folder === folder) return;

    this.utils.getDirectories(folder).then((categories: string[]) => {
      this.renderer.bind.categoryData = {};
      this.renderer.bind.showOverlay = false;
      this.folder = folder;
      this.renderer.bind.activeFolder = folder;
      this.renderer.bind.categories = [];
      let data = this.utils.getLocalStorageFolders();
      categories.forEach((category: string) => {
        if (
          folder &&
          data[folder] &&
          !data[folder].categories[category]
        ) {
          this.save(category);
        }
      });
      data = this.utils.getLocalStorageFolders();
      let order: string[] = data[folder].order;

      this.getLooseFiles().then((files: string[]) => {
        this.renderer.bind.looseFiles = `${files.length} loose files`
      });

      // If the category list is greater than 0 we render it and remove the section tip
      if (categories.length > 0) {
        order = this.cleanUpFolderOrder(order, categories)
        // Use the defined order if exists
        let folders = (order.length ? order : categories);
        this.renderer.bind.categories = folders;
        this.renderer.bind.showTip = false;
        folders.forEach((category: string) => {
          this.setCategoryData(folder, category);
        });
      } else {
        // If not, the section is enabled but we show the tip
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
  private collapseExpandedSearch() {
    this.renderer.bind.categories.forEach((category: string) => {
      const data = this.renderer.bind.categoryData[category];
      if (data && data.searchExpanded) {
        this.renderer.bind.expandCategory(category, 'searchExpanded');
      }
    });
  }

  private getLooseFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.renderer.bind.activeFolder, (err, contents) => {
        let files = contents.filter(content => {
            return this.utils.isActualFile(path.resolve(this.renderer.bind.activeFolder, content), content);
          });  
        resolve(files);    
      });
    });
  }

  private setCategoryData(folder: string, category: string) {
    const content = fs.readdirSync(path.resolve(folder, category));
    const files = content.filter((file) => {
      return this.utils.isActualFile(path.resolve(folder, category, file), file)
    });
    this.renderer.bind.categoryData[category] = {
      files,
      expanded: false,
      searchExpanded: false,
    };
  }
}
