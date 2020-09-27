import { remote } from 'electron';

export class FolderHandler {
    public path: string | null;
    public folders: any;
    public activeRef!: Element;
    public activeFolder: string | null = null;
    listRef: HTMLElement | null;

    private inputRef: Element | null;
    private subcriptions: any = {
        change: [],
        submit: []
    };

    constructor () {
        this.path = null;
        this.inputRef = document.querySelector('div.folder-input');
        this.inputRef?.addEventListener('click', (event: any) => this.addFolder(event));
        this.listRef = document.querySelector('smart-hover.folder-list');
        this.folders = this.getLocalFolders();

        if (Object.keys(this.folders).length == 0) {
            this.showTip();
        }
    }

    on(event: string, callback: any) {
        if (this.subcriptions[event]) {
            this.subcriptions[event].push(callback);
        }
    }

    submit(event: any) {
        if (this.path && this.saveLocalFolder(this.path)) {
            this.dispatchEvents('submit', event);
            this.removeTip();
        }
    }

    deleteLocalFolder(folder: string) {
        let data: any = this.getLocalFolders();
        if (data[folder]) {
            delete data[folder];
            localStorage.setItem('folders', JSON.stringify(data));
        }
    }

    private dispatchEvents(event: string, original: any) {
        let eventData = {
            event: event,
            originalEvent: original
        }

        if (this.subcriptions[event] && this.subcriptions[event].length > 0) {
            this.subcriptions[event].forEach((callback: any) => {
                callback(eventData);
            });
        }
    }

    private getLocalFolders() {
        let data = {};
        let raw: string | null = localStorage.getItem('folders');
        if (raw) {
            data = JSON.parse(raw);
        }
        return data;
    }

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

    private async addFolder(event: any) {
        var path = await remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (path.filePaths.length > 0) {
            this.path = path.filePaths[0];
        }
        this.submit(event);
        this.dispatchEvents('change', event);
    }

    private showTip() {
        let tip = this.listRef?.querySelector('.section-tip');
        if (tip && !tip.classList.contains('active')) {
            tip.classList.add('active');
        }
    }

    private removeTip() {
        let tip = this.listRef?.querySelector('.section-tip');
        if (tip && tip.classList.contains('active')) {
            tip.classList.remove('active');
        }
    }
}