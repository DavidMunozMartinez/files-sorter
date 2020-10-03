import { remote } from 'electron';
import { CategoriesHandler } from '../right-column/categories-handler';

export class FolderHandler {
    // List item selected/active
    public selectedRef!: Element | null;
    // List element reference
    public listRef: HTMLElement | null;
    // Button that opens the folder selection dialog
    private addButtonRef: Element | null;

    // Object that stures different functions that can be executed whenever
    // specific logic of this component is executed
    private subcriptions: any = {
        deleted: [],
        added: []
    };

    // Handles all logic related to the categories section
    categoriesHandler: CategoriesHandler = new CategoriesHandler();

    constructor () {
        this.addButtonRef = document.querySelector('div.folder-input');
        this.addButtonRef?.addEventListener('click', (event: any) => this.folderDialog(event));
        this.listRef = document.querySelector('smart-hover.folder-list');
        let folders = this.getLocalFolders();
        let foldersArr: Array<string> = Object.keys(folders);
        if (foldersArr && foldersArr.length > 0) {
            foldersArr.forEach((folder, index) => {
                this.add(folder, index == foldersArr.length - 1);
            });

        }

        if (foldersArr.length == 0) {
            this.showTip();
        }
    }

    /**
     * Allows to subscribe to specific events triggered from this component
     * @param event Event name to subscribe to 'deleted' | 'added'
     * @param callback Function that will be executed when the even is triggered
     */
    on(event: string, callback: any) {
        if (this.subcriptions[event]) {
            this.subcriptions[event].push(callback);
        }
    }
    
    /**
     * Adds a folder to the folder list, and automatically selets it if defined
     * @param folder Folder string path to add
     * @param select Determines if this folder will be automatically selected when added to the DOM
     */
    add(folder: string, select?: boolean) {
        if (this.listRef) {
            let listElement = this.createListElement(folder);
            this.listRef.append(listElement);
            this.dispatchEvents('added', folder);
            if (select) {
                this.select(listElement, folder);
            }
        }
    }

    /**
     * Sets a list element as active
     * @param item List item HTML reference to select
     * @param folder Folder string path to select
     */
    select(item: HTMLElement | Element, folder: string) {
        if (this.selectedRef) {
            this.selectedRef.classList.toggle('active');
        }
        item.classList.toggle('active');
        this.categoriesHandler.setActiveFolder(folder);
        this.selectedRef = item;
    }

    /**
     * Removes a list item from the list ref, it also makes sure to clean up the categories section 
     * @param item List item HTML reference to remove
     */
    remove(item: HTMLElement) {
        if (!this.listRef) {
            return;
        }
        this.listRef.removeChild(item);
        this.categoriesHandler.hideTip();
        this.categoriesHandler.showOverlay();
        this.categoriesHandler.clearCategoryList();
        let items = this.listRef.querySelectorAll('.folder-list-item');
        if (items && items.length == 0) {
            this.categoriesHandler.activeFolder = null;
            this.showTip();
        }
        else {
            let item = items[0];
            let folder = item.querySelector('.value-holder');

            if (folder) {
                this.select(item, folder.innerHTML);
            }
        }
    }

    /**
     * Deletes all stored data related to a specific folder
     * @param folder Folder string path to delete from storage
     */
    deleteData(folder: string) {
        let data: any = this.getLocalFolders();
        if (data[folder]) {
            delete data[folder];
            localStorage.setItem('folders', JSON.stringify(data));
            this.dispatchEvents('deleted', folder);
        }
    }

    /**
     * Makes the tip for this section visible
     */
    showTip() {
        let tip = this.listRef?.querySelector('.section-tip');
        if (tip && !tip.classList.contains('active')) {
            tip.classList.add('active');
        }
    }

    /**
     * Makes the tip for this section invisible
     */
    removeTip() {
        let tip = this.listRef?.querySelector('.section-tip');
        if (tip && tip.classList.contains('active')) {
            tip.classList.remove('active');
        }
    }

    /**
     * Dispatches all subscptions to a specific event
     * @param event Event name to be dispatched
     * @param data Data that will be sent to the event subscriptions
     */
    private dispatchEvents(event: string, data: any) {
        if (this.subcriptions[event] && this.subcriptions[event].length > 0) {
            this.subcriptions[event].forEach((callback: any) => {
                callback(data);
            });
        }
    }

    /**
     * Retreives all sotred folders data
     */
    private getLocalFolders() {
        let data = {};
        let raw: string | null = localStorage.getItem('folders');
        if (raw) {
            data = JSON.parse(raw);
        }
        return data;
    }

    /**
     * Stores folder path in local storage, onlu if its not already there
     * @param folder Folder path string to store
     */
    private saveLocalFolder(folder: string): boolean {
        let data: any = this.getLocalFolders();
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

        let removeIcon = this.makeElement('i', {
            classList: ['material-icons'],
            innerHTML: 'close',
            attrs: { deletes: folder },
            click: (event: any) => {
                this.remove(listItem);
                this.deleteData(folder);
                event.stopImmediatePropagation();
            }
        });

        let listItem = this.makeElement('div', {
            classList: ['folder-list-item'],
            click: () => {
                this.select(listItem, folder);
            },
            children: [valueElement, removeIcon]
        });

        return listItem;
    }

    /**
     * Opens OS folder selector dialog
     */
    private async folderDialog() {
        var path = await remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (path.filePaths.length > 0) {
            this.submit(path.filePaths[0]);
        }
        
    }

    /**
     * Executed once a folder has been selected from the folder selector dialog
     * @param folder Folder path string that has been selected
     */
    private submit(folder: string) {
        if (this.saveLocalFolder(folder)) {
            this.add(folder, true);
            this.removeTip();
            this.dispatchEvents('selected', folder);
        }
    }

    /**
     * Creates an HTML element based on an options object
     * @param tag Tag name
     * @param opts Options object that define the element
     */
    private makeElement(tag: string, opts: any): HTMLElement {
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
}