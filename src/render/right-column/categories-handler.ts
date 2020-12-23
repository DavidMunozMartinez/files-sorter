import { FileSorter } from '../file-sorter';
import { SectionHandler } from '../sections-handler';
import { RulesHandler } from './rules-handler';
import { ExtensionsHandler } from './extensions-handler';
import { Utils } from '../utils';

import Sortable from "sortablejs";

export class CategoriesHandler extends SectionHandler {
    inputRef: HTMLElement | null;
    folder: string | null = null;
    extensionHandler: ExtensionsHandler;
    fileSorter: FileSorter;
    rulesHandler: RulesHandler;

    constructor(fileSorter: FileSorter, utils: Utils) {
        super('div.categories', 'smart-hover.category-list', '.category-list-item');
        this.fileSorter = fileSorter;
        this.rulesHandler = new RulesHandler('.rules-view-container');
        this.extensionHandler = new ExtensionsHandler(fileSorter, utils);
        this.inputRef = this.contentRef.querySelector('div.category-input');

        if (this.listRef) {
            const sortable = new Sortable(this.listRef, {
                animation: 180,
                draggable: '.category-list-item',
                ghostClass: 'sortable-ghost',
                onEnd: () => {
                    this.reorderCategories();
                }
            });
        }
        this.inputRef?.addEventListener('keydown', (event: any) => {
            if (event.which === 13) {
                this.onEnter(event);
            }
        });

        this.inputRef?.addEventListener('blur', (event: any) => {
            event.target.innerText = '';
        })

        // Executed when a new item is added to the section list
        this.on('added', (item: HTMLElement, items: NodeList) => {
            if (items.length === 1) {
                this.hideTip();
                this.select(item);
            }
        });

        // Executed when a list item is selected
        this.on('selected', (item: HTMLElement) => {
            const category = item.getAttribute('value');
            if (this.folder && category) {
                this.extensionHandler.enable(this.folder, category);
                this.hideOverlay();
            }
        });

        // Executed when an item is removed from the section list
        this.on('removed', (item: HTMLElement, items: NodeList) => {
            const category = item.getAttribute('value');
            if (items.length === 0) {
                this.showTip();
                this.extensionHandler.clearList();
                this.extensionHandler.showOverlay();
                this.extensionHandler.hideTip();
            }

            if (category == this.extensionHandler.category) {
                this.extensionHandler.clearList();
                this.extensionHandler.showOverlay();
                this.extensionHandler.hideTip();
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
        if (this.folder === folder) {
            return;
        }
        this.hideOverlay();

        this.folder = folder;
        this.clearList();
        const data = this.getFolders();
        const order: string[] = data[this.folder].order;

        const activeRef = this.contentRef.querySelector('.active-folder');
        if (activeRef) {
            activeRef.classList.remove('disabled');
            activeRef.children[1].innerHTML = folder;
        }

        // If the category list is greater than 0 we render it and remove the section tip
        if (order.length > 0) {
            const items: HTMLElement[] = order.map((category) => {
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
            // this.extensionHandler.clearList();
            // this.extensionHandler.disable();
        }
    }

    /**
     * Disables the categories section by showing the overlay and hiding the tip
     * it also sets folder to null and clears and disables the extensions section
     */
    disable() {
        this.showOverlay();
        this.hideTip();
        this.folder = null;
        // this.extensionHandler.clearList()
        // this.extensionHandler.disable();

        const activeRef = this.contentRef.querySelector('.active-folder');
        if (activeRef) {
            if (!activeRef.classList.contains('diabled')) {
                activeRef.classList.add('disabled')
            }
        }
    }

    /**
     * Executed when the enter key is pressed on the section input
     * @param event Native DOM event
     */
    private onEnter(event: any) {
        if (!this.inputRef) {
            return;
        }

        const value = this.inputRef.innerText;
        if (this.save(value)) {
            const item = this.createListElement(value);
            this.renderItem(item);
            this.inputRef.innerText = '';
        }
        event.preventDefault();
    }

    /**
     * Saves in local storage a category string on the current active folder
     * @param category Category string to save
     */
    private save(category: string) {
        if (!this.folder || category === '') {
            return false;
        }
        let success = false;
        const folders = this.getFolders();
        const folder = folders[this.folder];
        const categories = folder.categories;

        if (!categories[category]) {
            categories[category] = [];
            folder.order.push(category);
            localStorage.setItem('folders', JSON.stringify(folders));
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

        const folders = this.getFolders();
        const folder: {
            order: string[],
            categories :any
        } = folders[this.folder];

        if (folder.categories && folder.categories[category]) {
            delete folder.categories[category];
        }

        const orderIndex = folder.order.indexOf(category);
        if (folder.order && folder.order.length > 0 && orderIndex > -1) {
            folder.order.splice(orderIndex, 1);
        }

        localStorage.setItem('folders', JSON.stringify(folders));
        this.fileSorter.updateFoldersData();
    }

    /**
     * Creates an HTML element that will be rendered in the section list
     * @param value Category string value
     */
    private createListElement (value: string): HTMLElement {
        const folderIcon = this.makeElement('i', {
            classList: ['material-icons'],
            innerHTML: 'folder'
        });

        const valueHolder = this.makeElement('span', {
            innerHTML: value
        });

        const item = this.makeElement('div', {
            classList: ['category-list-item'],
            attrs: ['value=' + value],
            children: [folderIcon, valueHolder],
            click: () => {
                if (this.folder) {
                    this.extensionHandler.enable(this.folder, value);
                }
            }
        });

        return item;
    }

    private reorderCategories() {
        const items = this.listRef?.querySelectorAll(this.listItemSelector);
        const data = this.getFolders();
        if (!items || !this.folder || !data[this.folder]) {
            return;
        }

        const order: string[] = [];
        data[this.folder].order = [];

        items.forEach((item) => {
            const value = item.getAttribute('value');
            if (value) {
                order.push(value);
            }
        });

        data[this.folder].order = order;
        localStorage.setItem('folders', JSON.stringify(data));
        this.fileSorter.updateFoldersData();
    }
}