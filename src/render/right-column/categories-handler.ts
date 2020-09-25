export class CategoriesHandler {
    elementRef: HTMLElement | null;
    overlayRef: HTMLElement | null | undefined;
    inputRef: HTMLElement | null | undefined;
    listRef: HTMLElement | null | undefined;
    activeFolder: string | null;
    activeCategoryList!: Array<string>;

    constructor () {
        this.elementRef = document.querySelector('div.categories');
        this.inputRef = this.elementRef?.querySelector('div.category-input');
        this.listRef = this.elementRef?.querySelector('smart-hover.category-list');
        this.overlayRef = this.elementRef?.querySelector('div.inactive-overlay');
        this.activeFolder = null;
        this.setupEvents();
    }

    setActiveFolder(folder: string | null) {
        this.activeFolder = folder;
        if (folder) {
            this.hideOverlay();
            this.activeCategoryList = this.getCategoriesForFolder(folder);
            this.renderCategoryList();
        }
        else {
            this.showOverlay();
        }
    }

    addCategory() {
        if (this.inputRef) {
            let value = this.inputRef.innerText;
            this.storageNewCategory(value);
            this.appendListItem(value);
            this.inputRef.innerText='';
        }
    }

    private setupEvents() {
        this.inputRef?.addEventListener('keydown', (event: any) => {
            if (event.which == 13) {
                this.addCategory();
                event.preventDefault();
                event.target.blur();
                event.target.focus();
            }
        })
    }

    private hideOverlay() {
        if (this.overlayRef && !this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.add('hiden');
        }
    }

    private showOverlay() {
        if (this.overlayRef && this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.remove('hiden')
        }
    }

    private storageNewCategory(value: string) {
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
        }
    }

    private getCategoriesForFolder(folder: string): Array<string> {
        let categories: Array<string> = [];
        let raw = localStorage.getItem('folders');
        if (raw) {
            let data = JSON.parse(raw);
            categories = Object.keys(data[folder].categories);
        }
        return categories;
    }

    private renderCategoryList() {
        if (this.activeCategoryList && this.activeCategoryList.length > 0) {
            this.activeCategoryList.forEach((category) => {
                this.appendListItem(category);
            });
        }
    }

    private appendListItem(value: string) {
        let item = document.createElement('div');
        item.classList.add('category-list-item');
        item.innerText = value;
        this.listRef?.append(item);
        
    }
}