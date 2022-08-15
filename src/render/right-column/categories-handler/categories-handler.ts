import { FileSorter } from "../../file-sorter";
import { SectionHandler } from "../../sections-handler";
import { ExtensionsHandler } from "./../rules-handler/extensions-handler";
import { Utils } from "../../utils";
import path from "path";
import Sortable from "sortablejs";
import { NotificationComponent } from "../../notification-component/notification-component";
import fs from "fs";
import { Bind } from "bindrjs";
import { Renderer } from "../../app-renderer";

interface CategoryItem {
  name: string
}



export class CategoriesHandler {
  // inputRef: HTMLElement | null;
  folder: string | null = null;
  extensionHandler: ExtensionsHandler;
  fileSorter: FileSorter;
  utils: Utils;
  notificationService: NotificationComponent;
  dragging: string | null = null;
  activeCategory: string | null = null;

  renderer!: Bind;

  constructor(
    fileSorter: FileSorter,
    utils: Utils,
    notificationService: NotificationComponent
  ) {
    // super("div.categories", "smart-hover.category-list", ".category-list-item");

    this.renderer = new Bind({
      id: 'categories-handler',
      template: require('./categories-handler.html'),
      bind: {
        activeFolder: null,
        looseFiles: null,
        // active: null
      },
      ready: () => {
        let categoryList = document.getElementsByClassName('category-list')[0] as HTMLElement;
        if (categoryList) {
          new Sortable(categoryList, {
            animation: 180,
            draggable: ".category-list-item",
            onStart: (event: any) => {
              // this.select(event.item);
              this.dragging = this.activeCategory;
            },
            onEnd: (event: any) => {
              // this.reorderCategories();
              setTimeout(() => {
                this.dragging = null;
              }, 200);
            },
          });
        }
      }
    });

    this.fileSorter = fileSorter;
    this.utils = utils;
    this.notificationService = notificationService;
    this.extensionHandler = new ExtensionsHandler(
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

    this.renderer.bind.onInputKeydown = (event: KeyboardEvent, input: 'add' | 'search') => {
      switch (input) {
        case 'add':
          if (event.which === 13) {
            this.onEnter(event);
            console.log('Entered');
          }
          break;
        case 'search':
          let input = event.target as HTMLElement;
          setTimeout(() => {
            if (event && input) {
              this.filterList(input.innerText);
              console.log('Filtering to: ', input.innerText);
            }
          }, 50);
          break;
      }
    }

    this.renderer.bind.onDblclick = (category: string) => {
      let fullPath = path.resolve(this.folder || "", category);
      this.utils.revealInExplorer(fullPath);
    }

    this.renderer.bind.select = (category: string) => {
      if (this.folder && category) {
        this.extensionHandler.enable(this.folder, category);
        this.activeCategory = category;
        this.renderer.bind.active = category;
      }
    }

    // this.renderer.bind.onItemClick = (category: string) => {
    //   this.renderer.bind.active = category;
    // }

    // this.inputRef = this.contentRef.querySelector("div.category-input");
    // const helpRef = document.getElementById('categories-help');
    // helpRef?.addEventListener('click', () => this.notificationService.showConsecutiveTips(['CATEGORIES_TIP', 'REORDER_CATEGORIES', 'DELETE']));

    // if (this.listRef) {
    // }

    // Executed when a new item is added to the section list
    // this.on("added", (item: HTMLElement, items: NodeList) => {
    //   if (items && items.length === 1) {
    //     this.hideTip();
    //     this.select(item);
    //   }
    // });

    // Executed when a list item is selected
    // this.on("selected", (item: HTMLElement) => {
    //   const category = item.getAttribute("value");
    //   if (this.folder && category) {
    //     this.extensionHandler.enable(this.folder, category);
    //     this.activeCategory = category;
    //     this.hideOverlay();
    //   }
    // });

    // Executed when an item is removed from the section list
    // this.on("removed", (item: HTMLElement, items: NodeList) => {
    //   const category = item.getAttribute("value");
    //   if (items.length === 0) {
    //     this.showTip();
    //     this.extensionHandler.clearList();
    //     this.extensionHandler.showOverlay();
    //     this.extensionHandler.hideTip();
    //   }

    //   if (category === this.extensionHandler.category) {
    //     this.extensionHandler.clearList();
    //     this.extensionHandler.showOverlay();
    //     this.extensionHandler.hideTip();
    //   }

    //   if (category) {
    //     this.delete(category);
    //     this.notificationService.showTipIfNeeded("DELETE");
    //   }
    // });
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
      // this.hideOverlay();

      this.folder = folder;
      this.renderer.bind.categories = [];
      // this.clearList();
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
      const order: string[] = data[this.folder].order;
      this.renderer.bind.activeFolder = folder;

      fs.readdir(folder, (err, contents) => {
        let files = contents.filter(content => fs.statSync(path.resolve(folder, content)).isFile());
        // this.renderer.bind.looseFiles = `${files.length} loose files`
      });

      // const activeRef = this.contentRef.querySelector(".active-folder");
      // if (activeRef) {
      //   activeRef.classList.remove("disabled");
      // }

      // If the category list is greater than 0 we render it and remove the section tip
      if (categories.length > 0) {
        let items: CategoryItem[] = (order.length ? order : categories).map(category => {
          return {
            name: category
          }
        });
        this.renderer.bind.categories = items
        // this.hideTip();
      }
      // If not, the section is enabled but we show the tip
      else {
        // this.inputRef?.focus();
        // this.showTip();
        // this.hideOverlay();
        this.extensionHandler.clearList();
        this.extensionHandler.disable();
      }
    });
  }

  /**
   * Disables the categories section by showing the overlay and hiding the tip
   * it also sets folder to null and clears and disables the extensions section
   */
  disable() {
    // this.showOverlay();
    // this.hideTip();
    this.folder = null;
    this.extensionHandler.clearList();
    this.extensionHandler.disable();

    // const activeRef = this.contentRef.querySelector(".active-folder");
    // if (activeRef) {
    //   if (!activeRef.classList.contains("disabled")) {
    //     activeRef.classList.add("disabled");
    //   }
    // }
  }

  filterList(searchTerm: string) {
    // let children = this.listRef?.children;

    // if (children && children.length) {
    //   for (let i = 0; i < children.length; i++) {
    //     let child = children[i] as HTMLElement;
    //     let value = child.getAttribute('value') || '';
    //     child.style.display = value.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ? 'block' : 'none';
    //   }
    // }
  }

  /**
   * Executed when the enter key is pressed on the section input
   * @param event Native DOM event
   */
  private onEnter(event: any) {
    // if (!this.inputRef || !this.folder) {
    //   return;
    // }

    // // const value = this.inputRef.innerText;
    // let destination = path.resolve(this.folder, value);
    // fs.mkdir(destination, (err) => {
    //   if (err) {
    //     let alreadyExists = err.message.indexOf('EEXIST') > -1;
    //     let message = 'Oops, something went wrong'
    //     if (alreadyExists) {
    //       message = `Folder "${value}" already exists`;
    //     }
    //     this.notificationService.notify({
    //       message: message,
    //       type: "error",
    //       timer: 0,
    //     });
    //     return;
    //   }
    //   if (this.save(value)) {
    //     // this.inputRef.innerText = "";
    //     // const item = this.createListElement(value);
    //     // this.renderItem(item);
    //     // this.select(item);
    //     // this.reorderCategories();
    //     // item.scrollIntoView();
    //     this.notificationService.showTipIfNeeded("REORDER_CATEGORIES");
    //   }
    // });
    // event.preventDefault();
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
      // folder.order.push(category);
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
    if (folder.order && folder.order.length > 0 && orderIndex > -1) {
      folder.order.splice(orderIndex, 1);
    }

    localStorage.setItem("folders", JSON.stringify(folders));
    this.fileSorter.updateFoldersData();
  }

  /**
   * Creates an HTML element that will be rendered in the section list
   * @param value Category string value
   */
  // private createListElement(value: string): HTMLElement {
  //   const folderIcon = this.makeElement("i", {
  //     classList: ["material-icons"],
  //     innerHTML: "folder",
  //   });

  //   const valueHolder = this.makeElement("span", {
  //     innerHTML: value,
  //   });

  //   const item = this.makeElement("div", {
  //     classList: ["category-list-item"],
  //     attrs: ["value=" + value],
  //     children: [folderIcon, valueHolder],
  //     dblclick: () => {
  //       let fullPath = path.resolve(this.folder || "", value);
  //       this.utils.revealInExplorer(fullPath);
  //     },
  //   });

  //   return item;
  // }

  // private reorderCategories() {
  //   const items = this.listRef?.querySelectorAll(this.listItemSelector);
  //   const data = this.getFolders();
  //   if (!items || !this.folder || !data[this.folder]) {
  //     return;
  //   }

  //   const order: string[] = [];
  //   data[this.folder].order = [];

  //   items.forEach((item) => {
  //     const value = item.getAttribute("value");
  //     if (value) {
  //       order.push(value);
  //     }
  //   });

  //   data[this.folder].order = order;
  //   localStorage.setItem("folders", JSON.stringify(data));
  //   this.fileSorter.updateFoldersData();
  // }
}
