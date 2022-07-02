export class SectionHandler {
  contentRef!: HTMLElement;
  listRef: HTMLElement | null;
  overlayRef: HTMLElement | null;
  tipRef: HTMLElement | null;
  selected: HTMLElement | null = null;
  multiSelected: Element[] = [];
  listItemSelector: string;
  multiSelectable: boolean = false;

  private subscriptions: any = {
    added: [],
    removed: [],
    selected: [],
    cleared: [],
  };

  constructor(
    containerQuerySelector: string,
    listQuerySelector: string,
    itemSelector: string
  ) {
    const content: HTMLElement | null = document.querySelector(
      containerQuerySelector
    );
    if (content) this.contentRef = content;
    // this.contentRef = document.querySelector(containerQuerySelector);
    this.listRef = this.contentRef?.querySelector(listQuerySelector) || null;
    this.overlayRef =
      this.contentRef?.querySelector(".inactive-overlay") || null;
    this.tipRef = this.contentRef?.querySelector(".section-tip") || null;
    this.listItemSelector = itemSelector;
  }

  /**
   * Subscribes a callback function to specific section events
   * @param eventName Event name to subscribe
   * @param callback call back function that will be executed when the event is triggered
   */
  on(eventName: string, callback: any) {
    if (this.subscriptions[eventName]) {
      this.subscriptions[eventName].push(callback);
    }
  }

  /**
   * Creates an HTML element based on an options object
   * @param tag Tag name
   * @param opts Options object that define the element
   */
  makeElement(tag: string, opts: any): HTMLElement {
    const element = document.createElement(tag);
    if (opts.classList && opts.classList.length && opts.classList.length > 0) {
      element.classList.add(...opts.classList);
    }

    if (opts.attrs && opts.attrs.length && opts.attrs.length > 0) {
      opts.attrs.forEach((attr: string) => {
        const split = attr.split("=");
        const key = split[0];
        const value = split[1];
        element.setAttribute(key, value);
      });
    }

    if (opts.click && typeof opts.click === "function") {
      element.addEventListener("click", (event: any) => {
        opts.click(event);
      });
    }
    if (opts.dblclick && typeof opts.dblclick === "function") {
      element.addEventListener("dblclick", (event: any) => {
        opts.dblclick(event);
      });
    }
    if (opts.innerHTML) {
      element.innerHTML = opts.innerHTML;
    }
    if (opts.children && opts.children.length && opts.children.length > 0) {
      element.append(...opts.children);
    }
    return element;
  }

  /**
   * Renders a list of HTML elements into the list reference from the section
   * @param items List of HTML elements to render in the section list
   * @param selectIndex Optional index number to select an item once the list is rendered
   */
  renderList(items: HTMLElement[], selectIndex?: number) {
    const animation = 120;
    items.forEach((item, index) => {
      const delay = animation * index - index * 100;
      this.renderItem(item, {
        delay,
      });
    });

    if (selectIndex) {
      setTimeout(() => {
        this.select(items[selectIndex]);
      }, animation * items.length);
    }
  }

  /**
   * Takes an HTML element and renders it into the section list with an animation
   * @param item HTML element to render in the list
   * @param opts Options object for rendering the item
   */
  renderItem(item: HTMLElement, opts?: any | {}) {
    if (opts === undefined) opts = {};
    if (opts.delay === undefined) opts.delay = 0;
    if (opts.silent === undefined) opts.silent = false;
    if (opts.removable === undefined) opts.removable = true;
    if (opts.selectable === undefined) opts.selectable = true;

    if (opts.removable) {
      const removeIcon = this.makeElement("i", {
        classList: ["material-icons", "close-icon"],
        innerHTML: "close",
        click: (event: any) => {
          this.clearItem(item);
          event.stopImmediatePropagation();
        },
      });

      removeIcon.style.position = "relative";
      removeIcon.style.float = "right";
      item.prepend(removeIcon);
    }

    item.style.opacity = "0";
    item.style.transform = "translateX(-10px)";
    item.style.transition = "all 200ms ease-out";

    if (opts.selectable) {
      item.addEventListener("click", (event) => {
        if (event.ctrlKey && this.multiSelectable) {
          this.multiSelect(item);
        } else {
          this.select(item);
        }
      });
    }

    setTimeout(() => {
      item.style.transform = "";
      item.style.opacity = "1";
    }, opts.delay);

    this.listRef?.append(item);

    if (!opts.silent) {
      this.subscriptions.added.forEach((callback: any) => {
        const items = this.listRef?.querySelectorAll(this.listItemSelector);
        callback(item, items);
      });
    }
  }

  /**
   * Clears the section list items
   */
  clearList() {
    const items = this.listRef?.querySelectorAll(this.listItemSelector);
    if (items && items.length > 0) {
      items.forEach((item) => {
        this.listRef?.removeChild(item);
      });
    }
    this.subscriptions.cleared.forEach((callback: any) => {
      callback();
    });
  }

  /**
   * Removed a given html element from the section list
   * @param item HTML element that will be removed from the list
   */
  clearItem(item: HTMLElement) {
    item.style.opacity = "0";
    setTimeout(() => {
      const oldRef = this.listRef?.removeChild(item);
      this.subscriptions.removed.forEach((callback: any) => {
        const items = this.listRef?.querySelectorAll(this.listItemSelector);
        callback(oldRef, items);
      });
    }, 150);
  }

  /**
   * Sets a list element as active
   * @param item List item HTML reference to select
   * @param folder Folder string path to select
   */
  select(item: HTMLElement) {
    this.iterateSelected((element) => {
      element.classList.remove("active");
    });

    item.classList.add("active");
    this.multiSelected = [];
    this.selected = item;

    this.subscriptions.selected.forEach((callback: any) => {
      callback(item);
    });
  }

  multiSelect(item: HTMLElement) {
    item.classList.toggle("active");
    this.multiSelected = [];
    this.selected = null;
    this.iterateSelected((element) => {
      this.multiSelected.push(element);
    });
    this.subscriptions.selected.forEach((callback: any) => {
      callback(this.multiSelected);
    });
  }

  iterateSelected(callback: (item: Element) => void) {
    let activeItems = this.listRef?.getElementsByClassName("active");
    if (activeItems) {
      for (let element of activeItems) {
        // this.multiSelected.push(element);
        callback(element);
      }
    }
  }

  /**
   * Makes the tip for this section visible
   */
  showTip() {
    if (this.tipRef && !this.tipRef.classList.contains("active")) {
      this.tipRef.classList.add("active");
    }
  }

  /**
   * Makes the tip for this section invisible
   */
  hideTip() {
    if (this.tipRef && this.tipRef.classList.contains("active")) {
      this.tipRef.classList.remove("active");
    }
  }

  /**
   * Hides the overlay that blocks the section
   */
  hideOverlay() {
    if (this.overlayRef && !this.overlayRef.classList.contains("hiden")) {
      this.overlayRef.classList.add("hiden");
    }
  }

  /**
   * Shows an overlay that blocks the section
   */
  showOverlay() {
    if (this.overlayRef && this.overlayRef.classList.contains("hiden")) {
      this.overlayRef.classList.remove("hiden");
    }
  }

  /**
   * Returns all sotred data from folders
   */
  getFolders(): any {
    let data = {};
    const raw: string | null = localStorage.getItem("folders");
    if (raw) {
      data = JSON.parse(raw);
    }
    return data;
  }

  /**
   * Returns the defined categories for a specified folder path
   * @param folder Folder path to get defined categories from
   */
  getCategories(folder: string): any {
    const folders = this.getFolders();
    let categories = [];
    const data = folders[folder];
    if (data && data.categories) {
      categories = data.categories;
    }

    return categories;
  }

  /**
   * Retuns the list of extensions that are defined for the given folder path and category
   * @param folder Folder path string
   * @param category Category name to get the extensions from
   */
  getExtensions(folder: string, category: string): any {
    const categories: any = this.getCategories(folder);
    let extensions: any[] = [];
    if (categories && categories[category]) {
      extensions = categories[category];
    }

    return extensions;
  }
}
