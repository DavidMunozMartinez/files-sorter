import * as os from 'os';
import { FileSorter } from './file-sorter';
import { FolderHandler } from './left-column/folder-handler';
import 'smart-hoverjs';

class App {
    // Handles all logic to actually sort and move files arounf
    private fileSorter: FileSorter = new FileSorter();
    // Handles all logic around storing data and renedring the folders in the view
    private folderHandler: FolderHandler = new FolderHandler();

    constructor() {
        this.applyTitlebarStyles();

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

        this.folderHandler.on('removed', (folder: string) => {
            // this.fileSorter.deleteWatcher(folder);
        });

        this.folderHandler.on('added', (item: HTMLElement) => {
            // this.fileSorter.addWatcher(folder);
        });
    }

    /**
     * Applies title bar styles for the windows build only.
     */
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
} new App();