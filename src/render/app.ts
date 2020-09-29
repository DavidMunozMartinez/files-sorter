import * as os from 'os';
import { FileSorter } from './file-sorter';
import { FolderHandler } from './left-column/folder-handler';
import { CategoriesHandler } from './right-column/categories-handler';
import 'smart-hoverjs';

class App {
    private fileSorter: FileSorter = new FileSorter();
    private folderHandler: FolderHandler = new FolderHandler();
    private categoriesHandler: CategoriesHandler = new CategoriesHandler();
    private displayFolder = document.querySelector('.folder-path');
    private folderListRef = document.querySelector('.folder-list');

    constructor() {
        this.applyTitlebarStyles();
        
        this.folderHandler.on('submit', () => {
            if (this.folderHandler.path) {
                this.addToFolderList(this.folderHandler.path);
                this.fileSorter.addWatcher(this.folderHandler.path);
            }
        });

        this.folderHandler.on('change', () => {
            if (this.displayFolder && this.folderHandler.path) {
                this.displayFolder.innerHTML = this.folderHandler.path;
                this.displayFolder.setAttribute('title', this.folderHandler.path);
            }
        });

        this.categoriesHandler.on('stored', () => {
            this.fileSorter.updateFoldersData();
        });

        if (this.folderHandler.folders && Object.keys(this.folderHandler.folders).length > 0) {
            let folders = Object.keys(this.folderHandler.folders);
            folders.forEach((folder) => {
                this.addToFolderList(folder);
            })
        }

    }

    private applyTitlebarStyles() {
        if (os.platform() == 'darwin') {
            return;
        }
        let titlebar = document.createElement('div');
        let title = document.createElement('div');
        titlebar.id = 'electron-titlebar';
        titlebar.classList.add('drag');
        title.innerHTML = 'File Sorter';
        title.setAttribute('style', 'top: 5px; left: 5px; position: absolute');
        titlebar.append(title);
        document.body.prepend(titlebar);
        require('electron-titlebar');
    }

    private addToFolderList(folder: string) {
        if (this.folderListRef && folder) {
            let listElement = this.createListElement(folder);
            this.folderListRef.append(listElement);
            if (!this.folderHandler.activeRef) {
                this.selectionChanged(listElement);
            }
        }
    }

    private createListElement(folder: string): Element {
        let element = document.createElement('div');
        let valueHolder = document.createElement('div');
        let removeIcon = document.createElement('i');
        removeIcon.classList.add('material-icons');
        removeIcon.innerText = 'close';
        removeIcon.addEventListener('click', (event: any) => {
            this.fileSorter.deleteWatcher(folder);
            this.folderHandler.deleteLocalFolder(folder);

            if (this.categoriesHandler.activeFolder == folder) {
                this.categoriesHandler.clearCategoryList();
            }

            let target: HTMLElement = event.target;
            let item = target.closest('.folder-list-item');
            let list = target.closest('.folder-list');
            if (list && item) {
                list.removeChild(item);
            }

            let items = this.folderHandler.listRef?.querySelectorAll('.folder-list-item');
            if (items && items.length > 0) {
                this.selectionChanged(items[0]);
            }
            else {
                this.folderHandler.activeFolder = null;
                this.categoriesHandler.activeFolder = null;
                this.folderHandler.activeRef = null;
                this.folderHandler.showTip();
                this.categoriesHandler.removeTip();
                this.categoriesHandler.showOverlay();
            }

            event.stopImmediatePropagation();
        });
        valueHolder.classList.add('value-holder');
        valueHolder.innerHTML = folder;
        element.classList.add('folder-list-item');
        element.append(valueHolder);
        element.append(removeIcon);
        element.addEventListener('click', (event) => {
            this.selectionChanged(event.target);
        });
        return element;
    }

    private selectionChanged(target: any) {
        if (this.folderHandler.activeRef) {
            this.folderHandler.activeRef.classList.toggle('active');
        }
        this.folderHandler.activeRef = target;
        if (this.folderHandler.activeRef) {
            this.folderHandler.activeRef.classList.toggle('active');
            let valueElement: HTMLElement | null = this.folderHandler.activeRef.querySelector('.value-holder');
            let folder: string | null = valueElement?.innerText || null;
            this.categoriesHandler.setActiveFolder(folder);
        }
    }
}
// Instantiate the whole app
let app = new App();