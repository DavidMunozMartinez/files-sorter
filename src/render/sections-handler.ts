export class SectionHandler {

    contentRef: HTMLElement | null;
    listRef: HTMLElement | null;
    overlayRef: HTMLElement | null;
    tipRef: HTMLElement | null;
    selected: HTMLElement | null = null;

    private subscriptions: any = {
        added: [],
        removed: [],
        selected: []
    }

    constructor(containerQuerySelector: string, listQuerySelector: string) {
        this.contentRef = document.querySelector(containerQuerySelector);
        this.listRef = this.contentRef?.querySelector(listQuerySelector) || null;
        this.overlayRef = this.contentRef?.querySelector('.inactive-overlay') || null;
        this.tipRef = this.contentRef?.querySelector('.section-tip') || null;
    }

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
        let element = document.createElement(tag);
        if (opts.classList && opts.classList.length && opts.classList.length > 0) {
            element.classList.add(...opts.classList)
        }
        if (opts.click && typeof (opts.click) === 'function') {
            element.addEventListener('click', (event: any) => {
                opts.click(event);
            });
        }
        if (opts.innerHTML) {
            element.innerHTML = opts.innerHTML;
        }
        if (opts.children && opts.children.length && opts.children.length > 0) {
            element.prepend(...opts.children);
        }
        return element;
    }

    /**
     * Renders a list of HTML elements into the list reference from the section
     * @param items List of HTML elements to render in the section list
     * @param selectIndex Optional index number to select an item once the list is rendered
     */
    renderList(items: Array<HTMLElement>, selectIndex?: number) {
        let animation = 300
        items.forEach((item, index) => {
            this.renderItem(item, animation * index);
        });

        if (selectIndex) {
            setTimeout(() => {
                this.select(items[selectIndex])
            }, animation * items.length)
        }
    }

    renderItem(item: HTMLElement, delay: number) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-10px)';
        item.style.transition = 'all 200ms ease-out';
        item.onclick = () => {
            this.select(item);
        };
        setTimeout(() => {
            item.style.transform = 'translateX(0px)';
            item.style.opacity = '1';
        }, delay)
        this.listRef?.append(item);
    }

    clearList() {

    }

    clearItem() {}

    /**
     * Sets a list element as active
     * @param item List item HTML reference to select
     * @param folder Folder string path to select
     */
    select(item: HTMLElement) {
        if (this.selected) {
            this.selected.classList.remove('active');
        }

        item.classList.add('active');
        this.selected = item;

        this.subscriptions['selected'].forEach((callback: any) => {
            callback(item);
        });
    }

    /**
     * Makes the tip for this section visible
     */
    showTip() {
        if (this.tipRef && !this.tipRef.classList.contains('active')) {
            this.tipRef.classList.add('active');
        }
    }

    /**
     * Makes the tip for this section invisible
     */
    hideTip() {
        if (this.tipRef && this.tipRef.classList.contains('active')) {
            this.tipRef.classList.remove('active');
        }
    }

    /**
     * Hides the overlay that blocks the section
     */
    hideOverlay() {
        if (this.overlayRef && !this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.add('hiden');
        }
    }

    /**
     * Shows an overlay that blocks the section
     */
    showOverlay() {
        if (this.overlayRef && this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.remove('hiden');
        }

    }

    /**
     * Returns all sotred data from folders
     */
    getFolders(): any {
        let data = {};
        let raw: string | null = localStorage.getItem('folders');
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
        let folders = this.getFolders();
        let categories = [];
        let data = folders[folder];
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
        let categories: any =  this.getCategories(folder);
        let extensions: Array<any> = [];
        if (categories && categories[category]) {
            extensions = categories[category];
        }

        return extensions;
    }
}