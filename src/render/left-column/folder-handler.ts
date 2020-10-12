import { remote } from 'electron';
import { CategoriesHandler } from '../right-column/categories-handler';
import { SectionHandler } from '../sections-handler';

export class FolderHandler extends SectionHandler {
    private addButtonRef: Element | null;

    // Handles all logic related to the categories section
    categoriesHandler: CategoriesHandler = new CategoriesHandler();

    constructor () {
        super('.column.left-column', '.folder-list', '.folder-list-item');
        this.addButtonRef = document.querySelector('div.folder-input');
        this.addButtonRef?.addEventListener('click', () =>  this.folderDialog());

        let folders = Object.keys(this.getFolders());
        let items: Array<HTMLElement> = [];
        folders.forEach((item) => {
            items.push(this.createListElement(item));
        });

        if (items.length > 0) {
            this.renderList(items, 0);
        }
        else {
            this.showTip();
        }

        this.on('selected', (item: HTMLElement) => {
            let folder = item.querySelector('.value-holder');
            let value = folder?.innerHTML;
            if (value) {
                this.categoriesHandler.setActiveFolder(value);
            }
        });

        this.on('removed', (item: HTMLElement, items: NodeList) => {
            let folder = item.querySelector('.value-holder');
            let value = folder?.innerHTML;
            let data: any = this.getFolders();
            if (value && data[value]) {
                delete data[value];
                localStorage.setItem('folders', JSON.stringify(data));
            }

            // The event is triggered before the element is removed from DOM, so we can consider the list
            // as empty if the items length is 1
            if (items.length == 1) {
                this.showTip();
                this.categoriesHandler.hideTip();
                this.categoriesHandler.showOverlay();
                this.categoriesHandler.activeFolder = null;
            }
        });

        this.on('added', (item: HTMLElement, items: NodeList) => {
            if (items.length == 1) {
                this.hideTip();
                this.select(item);
            }
        });
    }

    /**
     * Opens OS folder selector dialog
     */
    private async folderDialog() {
        var path = await remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        let value = path.filePaths[0];
        if (!value) {
            return;
        }
        let saved = this.saveLocalFolder(value);
        if (this.listRef && saved) {
            let listElement = this.createListElement(value);
            this.renderItem(listElement);
        }
    }

    /**
     * Deletes all stored data related to a specific folder
     * @param folder Folder string path to delete from storage
     */
    deleteData(folder: string) {
        let data: any = this.getFolders();
        if (data[folder]) {
            delete data[folder];
            localStorage.setItem('folders', JSON.stringify(data));
        }
    }

    /**
     * Stores folder path in local storage, onlu if its not already there
     * @param folder Folder path string to store
     */
    private saveLocalFolder(folder: string): boolean {
        let data: any = this.getFolders();
        let success = false;
        if (!data[folder]) {
            data[folder] = {
                categories: {}
            }
            localStorage.setItem('folders', JSON.stringify(data));
            success = true;
        }
        return success;
    }

    /**
     * Created a DOM element that will be added to the folders list in the DOM
     * @param folder Folder path string to add to the list
     */
    private createListElement(folder: string): HTMLElement {
        let valueElement = this.makeElement('div', {
            classList: ['value-holder'],
            innerHTML: folder
        });

        let listItem = this.makeElement('div', {
            classList: ['folder-list-item'],
            children: [valueElement]
        });

        return listItem;
    }
}