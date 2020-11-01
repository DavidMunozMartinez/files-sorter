import { FileSorter } from './file-sorter';
import { FolderHandler } from './left-column/folder-handler';
import { Utils } from './utils';
import 'smart-hoverjs';
import 'chokidar';

class App {
    // Utilities instance
    private utils: Utils = new Utils();
    // Handles all logic to actually sort and move files arounf
    private fileSorter: FileSorter = new FileSorter();
    // Handles all logic around storing data and renedring the folders in the view
    private folderHandler: FolderHandler = new FolderHandler(this.fileSorter, this.utils);

    constructor() {
        this.applyTitlebarStyles();
        this.folderHandler.on('removed', (item: HTMLElement) => {
            const valueHolder = item.querySelector('.value-holder');
            const folder = valueHolder?.innerHTML;
            if (folder) {
                this.fileSorter.deleteWatcher(folder);
            }
        });

        this.folderHandler.on('added', (item: HTMLElement) => {
            const valueHolder = item.querySelector('.value-holder');
            const folder = valueHolder?.innerHTML;
            if (folder) {
                this.fileSorter.addWatcher(folder);
            }
        });

        const folders = Object.keys(this.folderHandler.getFolders());
        const items: HTMLElement[] = folders.map((folder) => {
            return this.folderHandler.createListElement(folder);
        });

        if (items.length > 0) {
            this.folderHandler.renderList(items, 0);
        }
        else {
            this.folderHandler.showTip();
        }
    }

    /**
     * Applies title bar styles for the windows build only.
     */
    private applyTitlebarStyles() {
        // require('electron-titlebar');
    }
}

const app = new App();