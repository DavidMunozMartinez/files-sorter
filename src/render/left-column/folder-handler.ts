import { remote } from 'electron';
import { FileSorter } from '../file-sorter';
import { CategoriesHandler } from '../right-column/categories-handler';
import { SectionHandler } from '../sections-handler';

export class FolderHandler extends SectionHandler {

    categoriesHandler: CategoriesHandler;
    fileSorter: FileSorter;

    constructor (fileSorter: FileSorter) {
        super('.column.left-column', '.folder-list', '.folder-list-item');
        // Handles all logic related to the categories section
        this.categoriesHandler = new CategoriesHandler(fileSorter);
        this.fileSorter = fileSorter;
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
            if (items.length == 0) {
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
            this.fileSorter.updateFoldersData();
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
                categories: {},
                active: false,
            }
            localStorage.setItem('folders', JSON.stringify(data));
            this.fileSorter.updateFoldersData();
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

        let sortIcon = this.makeElement('i', {
            classList: ['material-icons', 'sort-icon'],
            attrs: ['title: Apply sort configuration'],
            innerHTML: 'low_priority',
            click: (event: any)  => {
                let sorting = event.target.classList.contains('sorting');
                if (!sorting) {
                    event.target.classList.add('sorting');
                    this.fileSorter.sortFolder(folder).finally(() => {
                        console.log('Done');
                        event.target.classList.remove('sorting');
                    }).catch(() => {
                        // Notify that something went wrogn when sorting
                        event.target.classList.remove('sorting');
                    });
                }
            }
        });

        let data = this.getFolders();
        let active = data[folder].active || false;

        let watchIcon = this.makeElement('i', {
            classList: ['material-icons', 'watch-icon', (active ? 'enabled' : 'disabled')],
            attrs: ['title:On/Off automatically sort new files'],
            innerHTML: active ? 'visibility' : 'visibility_off',
            click: (event: any) => {
                let active = event.target.innerHTML == 'visibility';
                let data = this.getFolders();
                if (data[folder]) {
                    data[folder].active = !active;
                    event.target.innerHTML = active ? 'visibility_off' : 'visibility';
                    event.target.classList.toggle('disabled');
                    localStorage.setItem('folders', JSON.stringify(data));
                    this.fileSorter.updateFoldersData();
                }
                event.stopImmediatePropagation();
            }
        });

        let listItem = this.makeElement('div', {
            classList: ['folder-list-item'],
            children: [valueElement, sortIcon, watchIcon]
        });

        return listItem;
    }
}