import { SectionHandler } from '../sections-handler';
import { ExtensionsHandler } from './extensions-handler';

export class CategoriesHandler extends SectionHandler {
    inputRef: HTMLElement | null | undefined;
    folder: string | null = null;
    extensionHandler: ExtensionsHandler = new ExtensionsHandler();

    constructor() {
        super('div.categories', 'smart-hover.category-list', '.category-list-item');
        this.inputRef = this.contentRef?.querySelector('div.category-input');
        this.inputRef?.addEventListener('keydown', (event: any) => {
            if (event.which == 13) {
                this.onEnter(event);
            }
        })

        // Executed when a new item is added to the section list
        this.on('added', (item: HTMLElement, items: NodeList) => {
            if (items.length == 1) {
                this.hideTip();
                this.select(item);
            }
        });

        // Executed when a list item is selected
        this.on('selected', (item: HTMLElement) => {
            let category = item.getAttribute('value');
            if (this.folder && category) {
                this.extensionHandler.enable(this.folder, category);
                this.hideOverlay();
            }
        });

        // Executed when an item weill be removed from the sectin list
        this.on('removed', (item: HTMLElement, items: NodeList) => {
            let category = item.getAttribute('value');
            if (items.length == 1) {
                this.showTip();
                this.extensionHandler.clearList();
                this.extensionHandler.showOverlay();
                this.extensionHandler.hideTip();
            }

            if (category == this.extensionHandler.category) {
                this.extensionHandler.clearList();
            }

            if (category) {
                this.delete(category);
            }
        });
    }

    /**
     * Enables the category section with the given folder string
     * @param folder Folder string path
     */
    enable (folder: string) {
        if (this.folder == folder) {
            return;
        }
        this.hideOverlay();

        this.folder = folder;
        this.clearList();
        let categories = this.getCategories(folder);
        let categoryList = Object.keys(categories);

        // If the category list is greater than 0 we render it and remove the section tip
        if (categoryList.length > 0) {
            let items: Array<HTMLElement> = categoryList.map((category) => {
                return this.createListElement(category);
            });

            this.renderList(items);
            this.hideTip();
        }
        // If not, the section is enabled but we show the tip
        else {
            this.inputRef?.focus();
            this.showTip();
            this.hideOverlay();
            this.extensionHandler.clearList();
            this.extensionHandler.disable();
        }
    }

    disable() {
        this.showOverlay();
        this.hideTip();
        this.folder = null;

        this.extensionHandler.clearList()
        this.extensionHandler.disable();
    }

    private onEnter(event: any) {
        if (!this.inputRef) {
            return;
        }

        let value = this.inputRef.innerText;
        if (this.save(value)) {
            let item = this.createListElement(value);
            this.renderItem(item);
            this.inputRef.innerText = '';
        }
        event.preventDefault();
    }

    private save(category: string) {
        if (!this.folder || category == '') {
            return false;
        }
        let success = false;
        let folders = this.getFolders();
        let folder = folders[this.folder];
        let categories = folder.categories;

        if (!categories[category]) {
            categories[category] = [];
            localStorage.setItem('folders', JSON.stringify(folders));
            success = true;
        }

        return success;
    }

    private delete(category: string) {
        if (!this.folder) {
            return;
        }

        let folders = this.getFolders();
        let folder = folders[this.folder];

        if (folder.categories && folder.categories[category]) {
            delete folder.categories[category];
            localStorage.setItem('folders', JSON.stringify(folders));
        }
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