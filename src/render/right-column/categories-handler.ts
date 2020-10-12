import { SectionHandler } from '../sections-handler';
import { ExtensionsHandler } from './extensions-handler';

export class CategoriesHandler extends SectionHandler {
    inputRef: HTMLElement | null | undefined;

    activeFolder: string | null;
    // activeCategoryList!: Array<string>;

    extensionHandler: ExtensionsHandler;

    constructor() {
        super('div.categories', 'smart-hover.category-list', '.category-list-item');
        this.inputRef = this.contentRef?.querySelector('div.category-input');
        this.activeFolder = null;
        this.extensionHandler = new ExtensionsHandler();


        this.setupEvents();

        this.on('added', (item: HTMLElement, items: NodeList) => {
            if (items.length == 1) {
                this.hideTip();
                this.select(item);
            }
        });

        this.on('selected', (item: HTMLElement) => {
            let category = item.getAttribute('value');
            if (category) {
                this.extensionHandler.setActiveCategory(category);
            }
        });

        this.on('removed', (item: HTMLElement, items: NodeList) => {
            if (items.length == 1) {
                this.showTip();
            }
        });
    }

    setActiveFolder(folder: string) {
        if (this.activeFolder == folder) {
            return;
        }

        this.extensionHandler.setActiveFolder(folder);
        this.activeFolder = folder;
        this.clearList();
        this.hideOverlay();
        let categories = this.getCategories(folder);
        let categoryList = Object.keys(categories);

        if (categoryList.length > 0) {
            let items: Array<HTMLElement> = [];
            categoryList.forEach(category => {
                items.push(this.createListElement(category));
            });
            this.renderList(items);
            this.hideTip();
        }
        else {
            this.inputRef?.focus();
            this.showTip();
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

    private setupEvents() {
        this.inputRef?.addEventListener('keydown', (event: any) => {
            if (event.which == 13 && this.inputRef) {
                let value = this.inputRef.innerText;
                if (this.storeCategory(value)) {
                    let item = this.createListElement(value);
                    this.renderItem(item);
                    this.inputRef.innerText = '';
                }
                event.preventDefault();
            }
        })
    }

    private storeCategory(value: string) {
        if (!this.activeFolder || value == '') {
            return false;
        }
        let success = false;
        let folders = this.getFolders();
        let folder = folders[this.activeFolder];
        let categories = folder.categories;

        if (!categories[value]) {
            categories[value] = [];
            success = true;
            localStorage.setItem('folders', JSON.stringify(folders));
        }

        return success;
    }

    private createListElement (value: string): HTMLElement {
        let icon = this.makeElement('i', {
            classList: ['material-icons'],
            innerHTML: 'folder'
        });

        let valueHolder = this.makeElement('span', {
            innerHTML: value
        });

        let item = this.makeElement('div', {
            classList: ['category-list-item'],
            attrs: ['value:' + value],
            children: [icon, valueHolder],
        });
        return item;
    }
}