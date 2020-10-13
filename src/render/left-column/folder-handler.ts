import { remote } from 'electron';
import { CategoriesHandler } from '../right-column/categories-handler';
import { SectionHandler } from '../sections-handler';

export class FolderHandler extends SectionHandler {
    // Handles all logic related to the categories section
    categoriesHandler: CategoriesHandler = new CategoriesHandler();

    constructor () {
        super('.column.left-column', '.folder-list', '.folder-list-item');
        let addButtonRef = document.querySelector('div.folder-input');
        addButtonRef?.addEventListener('click', () =>  this.folderDialog());

        this.on('selected', (item: HTMLElement) => {
            let element = item.querySelector('.value-holder');
            let folder = element?.innerHTML;
            if (folder) {
                this.categoriesHandler.enable(folder);
            }
        });

        this.on('removed', (item: HTMLElement, items: NodeList) => {
            let folder = item.querySelector('.value-holder');
            let value = folder?.innerHTML;
            if (value) {
                this.delete(value);
            }
            // The event is triggered before the element is removed from DOM, so we can consider the list
            // as empty if the items length is 1
            if (items.length == 1) {
                this.showTip();
                this.categoriesHandler.clearList();
                this.categoriesHandler.disable()
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
        let saved = this.save(value);
        if (this.listRef && saved) {
            let listElement = this.createListElement(value);
            this.renderItem(listElement);
        }
    }

    /**
     * Deletes all stored data related to a specific folder
     * @param folder Folder string path to delete from storage
     */
    private delete(folder: string) {
        let data: any = this.getFolders();
        if (data && data[folder]) {
            delete data[folder];
            localStorage.setItem('folders', JSON.stringify(data));
        }
    }

    /**
     * Stores folder path in local storage, onlu if its not already there
     * @param folder Folder path string to store
     */
    private save(folder: string): boolean {
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
    createListElement(folder: string): HTMLElement {
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