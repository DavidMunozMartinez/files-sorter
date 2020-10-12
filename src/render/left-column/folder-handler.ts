import { remote } from 'electron';
import { CategoriesHandler } from '../right-column/categories-handler';
import { SectionHandler } from '../sections-handler';

export class FolderHandler extends SectionHandler {
    // List item selected/active
    public selectedRef!: Element | null;
    // Button that opens the folder selection dialog
    private addButtonRef: Element | null;

    // Object that stures different functions that can be executed whenever
    // specific logic of this component is executed
    // private subcriptions: any = {
    //     deleted: [],
    //     added: [],
    //     selected: []
    // };

    // Handles all logic related to the categories section
    categoriesHandler: CategoriesHandler = new CategoriesHandler();

    constructor () {
        super('.column.left-column', '.folder-list');
        this.addButtonRef = document.querySelector('div.folder-input');
        this.addButtonRef?.addEventListener('click', () =>  this.folderDialog() );
        let folders = Object.keys(this.getFolders());
        let items: Array<HTMLElement> = [];
        folders.forEach((item) => {
            items.push(this.createListElement(item));
        });

        this.renderList(items, folders.length - 1);

        this.on('selected', (item: HTMLElement) => {
            let folder = item.querySelector('.value-holder');
            let value = folder?.innerHTML;
            if (value) {
                this.categoriesHandler.setActiveFolder(value);
            }
        });

        this.on('removed', () => {});

        this.on('added', () => {});

        // if (foldersArr && foldersArr.length > 0) {
        //     foldersArr.forEach((folder, index) => {
        //         this.add(folder, index == foldersArr.length - 1);
        //     });

        // }

        // if (foldersArr.length == 0) {
        //     this.showTip();
        // }
    }

    /**
     * Allows to subscribe to specific events triggered from this component
     * @param event Event name to subscribe to 'deleted' | 'added'
     * @param callback Function that will be executed when the even is triggered
     */
    // on(event: string, callback: any) {
    //     if (this.subcriptions[event]) {
    //         this.subcriptions[event].push(callback);
    //     }
    // }
    
    /**
     * Adds a folder to the folder list, and automatically selets it if defined
     * @param folder Folder string path to add
     * @param select Determines if this folder will be automatically selected when added to the DOM
     */
    // add(folder: string, select?: boolean) {
    //     if (this.listRef) {
    //         let listElement = this.createListElement(folder);
    //         this.listRef.append(listElement);
    //         this.dispatchEvents('added', folder);
    //         if (select) {
    //             this.select(listElement, folder);
    //         }
    //     }
    // }

    /**
     * Sets a list element as active
     * @param item List item HTML reference to select
     * @param folder Folder string path to select
     */
    // select(item: HTMLElement) {
    //     // if (this.selectedRef) {
    //     //     this.selectedRef.classList.toggle('active');
    //     // }
    //     // item.classList.toggle('active');
    //     // this.categoriesHandler.setActiveFolder(folder);
    //     // this.selectedRef = item;
    // }

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
                // this.select(item, folder.innerHTML);
            }
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
            // this.dispatchEvents('deleted', folder);
        }
    }

    /**
     * Dispatches all subscptions to a specific event
     * @param event Event name to be dispatched
     * @param data Data that will be sent to the event subscriptions
     */
    // private dispatchEvents(event: string, data: any) {
    //     if (this.subcriptions[event] && this.subcriptions[event].length > 0) {
    //         this.subcriptions[event].forEach((callback: any) => {
    //             callback(data);
    //         });
    //     }
    // }

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
            children: [valueElement]
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
            // this.add(folder, true);
            this.hideTip();
            // this.dispatchEvents('selected', folder);
        }
    }
}