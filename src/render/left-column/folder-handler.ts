import { remote } from 'electron';
import { FileSorter, IMovedFileData } from '../file-sorter';
import { NotificationComponent } from '../notification-component/notification-component';
import { CategoriesHandler } from '../right-column/categories-handler';
import { SectionHandler } from '../sections-handler';
import { Utils } from '../utils';
import { Tips } from '../app-tips';

export class FolderHandler extends SectionHandler {

    categoriesHandler: CategoriesHandler;
    fileSorter: FileSorter;
    notificationService: NotificationComponent;
    utils: Utils;
    listReady: boolean = false;

    constructor (fileSorter: FileSorter, utils: Utils, notificationService: NotificationComponent) {
        super('.column.left-column', '.folder-list', '.folder-list-item');
        // Handles all logic related to the categories section
        this.categoriesHandler = new CategoriesHandler(fileSorter, utils, notificationService);
        this.fileSorter = fileSorter;
        this.notificationService = notificationService;
        this.utils = utils;
        const addButtonRef = document.querySelector('div.folder-input');
        addButtonRef?.addEventListener('click', () =>  this.folderDialog());

          this.contentRef.addEventListener('drop', (event) => {
            let folder = this.categoriesHandler.folder + '/' + this.categoriesHandler.dragging;
            if (!this.categoriesHandler.dragging) return;
            const saved = this.save(folder);
            if (this.listRef && saved) {
                const listElement = this.createListElement(folder);
                this.renderItem(listElement);
                this.select(listElement);
            }
          });


        this.on('selected', (item: HTMLElement) => {
            const element = item.querySelector('.value-holder');
            const folder = element?.innerHTML;
            if (folder) {
                this.categoriesHandler.enable(folder);
            }
        });

        this.on('removed', (item: HTMLElement, items: NodeList) => {
            const folder = item.querySelector('.value-holder');
            const value = folder?.innerHTML;
            if (value) {
                this.delete(value);
            }
            if (items.length === 0) {
                this.showTip();
                this.categoriesHandler.clearList();
                this.categoriesHandler.disable()
            }
        });

        this.on('added', (item: HTMLElement, items: NodeList) => {
          if (items.length === 1) {
              this.select(item);
                this.hideTip();
                let tip = this.notificationService.showTipIfNeeded('AUTO_SORT_ON_OFF');
                if (tip) {
                  tip.onClose = () => {
                    this.notificationService.showTipIfNeeded('MANUAL_SORT');
                  }
                }
            }
        });
    }

    /**
     * Opens OS folder selector dialog
     */
    private async folderDialog() {
        const path = await remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        const value = path.filePaths[0];
        if (!value) {
            return;
        }
        const saved = this.save(value);
        if (this.listRef && saved) {
            const listElement = this.createListElement(value);
            this.renderItem(listElement);
            this.select(listElement);
        }
    }

    /**
     * Deletes all stored data related to a specific folder
     * @param folder Folder string path to delete from storage
     */
    private delete(folder: string) {
        const data: any = this.getFolders();
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
        const data: any = this.getFolders();
        let success = false;
        if (!data[folder]) {
            data[folder] = {
                categories: {},
                active: false,
                order: []
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
        const valueElement = this.makeElement('div', {
            classList: ['value-holder'],
            innerHTML: folder
        });

        const sortIcon = this.makeElement('i', {
            classList: ['material-icons', 'sort-icon'],
            attrs: ['title=Apply sort configuration'],
            innerHTML: 'fact_check',
            click: (event: any)  => {
                const sorting = event.target.classList.contains('sorting');
                if (!sorting) {
                    event.target.classList.add('sorting');
                    this.fileSorter.sortFolder(folder).then((movedFiles: IMovedFileData[]) => {
                        this.notificationService.notifyFileMove(folder, movedFiles);
                        event.target.classList.remove('sorting');
                    }).catch((err) => {
                        if (err.indexOf('timeout') > -1) {
                            let message = `Timeout limit exceeded while sorting ${folder}`;
                            this.notificationService.notify({
                                timer: 6000,
                                message: message,
                                type: 'error'
                            });
                            this.notificationService.notifyOS('Sorting time out', message);
                        }
                        event.target.classList.remove('sorting');
                    });
                }
            }
        });

        let data = this.getFolders();
        let active = data[folder].active || false;

        const watchIcon = this.makeElement('i', {
            classList: ['material-icons', 'watch-icon', (active ? 'enabled' : 'disabled')],
            attrs: ['title=On/Off automatically sort new files'],
            innerHTML: active ? 'visibility' : 'visibility_off',
            click: (event: any) => {
                data = this.getFolders();
                active = event.target.innerHTML === 'visibility';
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

        const listItem = this.makeElement('div', {
            classList: ['folder-list-item'],
            children: [valueElement, sortIcon, watchIcon],
            dblclick: () => {
                this.utils.revealInExplorer(folder);
            }
        });

        return listItem;
    }
}