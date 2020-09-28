let platform = require('electron-platform');
import { FileSorter } from './file-sorter';
import { FolderHandler } from './left-column/folder-handler';
import { CategoriesHandler } from './right-column/categories-handler';

if (!platform.isDarwin) {
    const titlebar = document.createElement('div');
    const title = document.createElement('div');
    titlebar.id = 'electron-titlebar';
    titlebar.classList.add('drag');
    title.innerHTML = 'File Sorter';
    title.setAttribute('style', 'top: 5px; left: 5px; position: absolute');
    titlebar.append(title);
    document.body.prepend(titlebar);
    require('electron-titlebar');
}

// Defining handlers
let fileSorter: FileSorter = new FileSorter();
let folderHandler: FolderHandler = new FolderHandler();
let categoriesHandler: CategoriesHandler = new CategoriesHandler();

// Elements refs
let displayFolder = document.querySelector('.folder-path');
let folderListRef: SmartHover | null = document.querySelector('.folder-list');

folderHandler.on('submit', () => {
    if (folderHandler.path) {
        addToFolderList(folderHandler.path);
        fileSorter.addWatcher(folderHandler.path);
    }
});

folderHandler.on('change', () => {
    if (displayFolder && folderHandler.path) {
        displayFolder.innerHTML = folderHandler.path;
        displayFolder.setAttribute('title', folderHandler.path);
    }
});

categoriesHandler.on('stored', () => {
    fileSorter.updateFoldersData();
})

if (folderHandler.folders && Object.keys(folderHandler.folders).length > 0) {
    let folders = Object.keys(folderHandler.folders);
    folders.forEach((folder) => {
        addToFolderList(folder);
    })
}

function addToFolderList(folder: string) {
    if (folderListRef && folder) {
        let listElement = createListElement(folder);
        folderListRef.append(listElement);
        if (!folderHandler.activeRef) {
            selectionChanged(listElement);
        }
    }
}

function createListElement(folder: string): Element {
    let element = document.createElement('div');
    let valueHolder = document.createElement('div');
    let removeIcon = document.createElement('i');
    removeIcon.classList.add('material-icons');
    removeIcon.innerText = 'close';
    removeIcon.addEventListener('click', (event: any) => {
        fileSorter.deleteWatcher(folder);
        folderHandler.deleteLocalFolder(folder);
        
        if (categoriesHandler.activeFolder == folder) {
            categoriesHandler.clearCategoryList();
        }

        let target: HTMLElement = event.target;
        let item = target.closest('.folder-list-item'); 
        let list = target.closest('.folder-list');
        if (list && item) {
            list.removeChild(item);
        }

        let items = folderHandler.listRef?.querySelectorAll('.folder-list-item');
        if (items && items.length > 0) {
            selectionChanged(items[0]);
        }

        event.stopImmediatePropagation();
    });
    valueHolder.classList.add('value-holder');
    valueHolder.innerHTML = folder;
    element.classList.add('folder-list-item');
    element.append(valueHolder);
    element.append(removeIcon);
    element.addEventListener('click', (event) => {
        selectionChanged(event.target);
    });
    return element;
}

function selectionChanged (target: any) {
    if (folderHandler.activeRef) {
        folderHandler.activeRef.classList.toggle('active');
    }
    folderHandler.activeRef = target;
    folderHandler.activeRef.classList.toggle('active');
    let valueElement: HTMLElement | null = folderHandler.activeRef.querySelector('.value-holder');
    let folder: string | null = valueElement?.innerText || null;
    categoriesHandler.setActiveFolder(folder);
}

// Define WebComponents
import { SmartHover } from './webcomponents/smart-hover';
window.customElements.define('smart-hover', SmartHover);






