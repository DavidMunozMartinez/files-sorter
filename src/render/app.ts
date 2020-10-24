import { FileSorter } from './file-sorter';
import { FolderHandler } from './left-column/folder-handler';
import 'smart-hoverjs';
import 'chokidar';

class App {
    // Handles all logic to actually sort and move files arounf
    private fileSorter: FileSorter = new FileSorter();
    // Handles all logic around storing data and renedring the folders in the view
    private folderHandler: FolderHandler = new FolderHandler(this.fileSorter);

    constructor() {
        this.applyTitlebarStyles();
        this.folderHandler.on('removed', (item: HTMLElement) => {
            let valueHolder = item.querySelector('.value-holder');
            let folder = valueHolder?.innerHTML;
            if (folder) {
                this.fileSorter.deleteWatcher(folder);
            }
        });

        this.folderHandler.on('added', (item: HTMLElement) => {
            let valueHolder = item.querySelector('.value-holder');
            let folder = valueHolder?.innerHTML;
            if (folder) {
                this.fileSorter.addWatcher(folder);
            }
        });

        let folders = Object.keys(this.folderHandler.getFolders());
        let items: Array<HTMLElement> = folders.map((folder) => {
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
} new App();