import { SectionHandler } from '../sections-handler';
import { ExtensionsHandler } from './extensions-handler';

export class CategoriesHandler extends SectionHandler {
    elementRef: HTMLElement | null;
    inputRef: HTMLElement | null | undefined;
    // listRef: HTMLElement | null | undefined;

    activeFolder: string | null;
    activeCategoryList!: Array<string>;
    // subscriptions: any = {
    //     stored: []
    // }

    extensionHandler: ExtensionsHandler;

    constructor() {
        super('div.categories', 'smart-hover.category-list');
        this.elementRef = document.querySelector('div.categories');
        this.inputRef = this.elementRef?.querySelector('div.category-input');
        // this.listRef = this.elementRef?.querySelector('smart-hover.category-list');
        this.activeFolder = null;
        this.extensionHandler = new ExtensionsHandler();
        // this.extensionHandler.on('stored', () => {
        //     this.subscriptions['stored'].forEach((fn: any) => {
        //         fn();
        //     });
        // })

        this.setupEvents();
    }

    setActiveFolder(folder: string | null) {
        if (!folder) {
            return;
        }
        if (this.activeFolder != folder) {
            this.activeFolder = folder;
            this.hideOverlay();
            this.activeCategoryList = Object.keys(this.getCategories(folder));
            this.renderCategoryList();
            this.extensionHandler.setActiveFolder(folder);
            if (this.activeCategoryList.length == 0) {
                setTimeout(() => {
                    this.inputRef?.focus();
                    this.showTip();
                }, 500);
            }
        }
    }

    addCategory() {
        if (this.inputRef) {
            let value = this.inputRef.innerText;
            this.storeCategory(value);
            this.appendListItem(value);
            this.inputRef.innerText = '';
        }
    }

    clearCategoryList() {
        if (!this.listRef) {
            return;
        }

        let items = this.listRef.querySelectorAll('.category-list-item');

        for (let i = 0; i < items.length; i++) {
            let child = items[i];
            this.listRef.removeChild(child);
        }

        this.extensionHandler.clearExtensionList();
    }

    // on(event: string, callback: any) {
    //     if (this.subscriptions[event]) {
    //         this.subscriptions[event].push(callback);
    //     }
    // }

    private setupEvents() {
        this.inputRef?.addEventListener('keydown', (event: any) => {
            if (event.which == 13) {
                this.addCategory();
                this.hideTip();
                event.preventDefault();
                event.target.blur();
                event.target.focus();
            }
        })
    }

    private storeCategory(value: string) {
        if (!this.activeFolder) {
            return;
        }
        let raw = localStorage.getItem('folders');
        if (raw) {
            let data = JSON.parse(raw);
            let folder = data[this.activeFolder];
            if (!folder.categories[value]) {
                folder.categories[value] = [];
            }

            localStorage.setItem('folders', JSON.stringify(data));
            // this.subscriptions['stored'].forEach((fn: any) => {
            //     fn();
            // });
        }
    }

    // private getCategoriesForFolder(folder: string): Array<string> {
    //     let folders = this.getFolders();
    //     let categories: Array<string> = [];
    //     let data = folders[folder]; 
    //     if (data && data.categories && data.categories.length && data.categories.length > 0) {
    //         categories = folders[folder].categories;
    //     }
    //     return categories;
    // }

    private renderCategoryList() {
        if (this.listRef) {
            this.clearCategoryList();
        }
        if (this.activeCategoryList && this.activeCategoryList.length > 0) {
            this.activeCategoryList.forEach((category) => {
                this.appendListItem(category);
            });
        }

        if (this.activeCategoryList.length > 0) {
            setTimeout(() => {
                this.extensionHandler.inputRef?.focus();
                this.extensionHandler.hideOverlay();
                this.extensionHandler.showTip();
            }, 170);
        }
        else {
            this.extensionHandler.showOverlay();
            this.extensionHandler.hideTip();
        }
    }


    private appendListItem(value: string) {
        let item = document.createElement('div');
        let icon = document.createElement('i');
        icon.classList.add('material-icons');
        icon.innerHTML = 'folder';
        item.classList.add('category-list-item');
        item.innerHTML = '<span>' + value + '</span>';
        item.prepend(icon);
        item.addEventListener('click', (event) => { this.onCategoryClick(event, value) });
        this.listRef?.append(item);
        this.onCategoryClick({
            target: item
        }, value);
    }

    private onCategoryClick(event: any, category: string) {
        if (!this.activeFolder) {
            return;
        }

        this.extensionHandler.setActiveFolder(this.activeFolder);
        this.extensionHandler.setActiveCategory(category);
        let active = this.listRef?.querySelector('.active');
        let target = event.target;

        if (active == target) {
            return;
        }
        if (active) {
            active.classList.remove('active');
        }
        event.target.classList.add('active');

        setTimeout(() => {
            this.extensionHandler.inputRef?.focus();
        }, 170)
    }
}