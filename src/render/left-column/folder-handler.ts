// import { dialog } from 'electron';
import { remote } from 'electron';

export class FolderHandler {
    public path: string | null;
    public folders: Array<string>;
    private trigger: Element | null;
    private submitter: Element | null;
    private subcriptions: any = {
        change: [],
        submit: []
    };

    constructor (trigger: string, submitter: string) {
        this.path = null;
        this.trigger = document.querySelector(trigger)
        this.submitter = document.querySelector(submitter);

        this.trigger?.addEventListener('click', () => this.select(event));
        this.submitter?.addEventListener('click', () => this.submit(event));

        this.folders = this.getLocalFolders();
    }

    on(event: string, callback: any) {
        if (this.subcriptions[event]) {
            this.subcriptions[event].push(callback);
        }
    }

    private async select(event: any) {
        var path = await remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (path.filePaths.length > 0) {
            this.path = path.filePaths[0];
        }

        this.dispatchEvents('change', event)
    }

    submit(event: any) {
        if (this.path && this.saveLocalFolder(this.path)) {
            this.dispatchEvents('submit', event);
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
        let data = [];
        let raw: string | null = localStorage.getItem('folders');
        if (raw) {
            data = JSON.parse(raw);
        }
        return data;
    }

    private saveLocalFolder(folder: string): boolean {
        let data = this.getLocalFolders();
        let success = false;
        if (data.indexOf(folder) == -1) {
            data.push(folder);
            localStorage.setItem('folders', JSON.stringify(data));
            success = true;
        }
        return success;
    }
}