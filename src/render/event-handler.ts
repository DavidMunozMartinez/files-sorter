import * as chokidar from 'chokidar';
import  path from 'path';
import * as os from 'os';
import * as fs from 'fs'

export class FileSorter {
    private paths: any;
    private defaultConfig = {
        persistent: true,
        depth: 2,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100
        },
        ignoreInitial: false

    };
    watchers: Array<any> = [];

    constructor () {
        this.paths = this.getLocalFolders();
        this.defineWatchers(this.paths);
        console.log(this.paths);
    }

    private getLocalFolders() {
        let data = {};
        let raw: string | null = localStorage.getItem('folders');
        if (raw) {
            data = JSON.parse(raw);
        }
        return data;
    }

    private defineWatchers(paths: any) {
        let folders = Object.keys(paths);

        folders.map((folder) => {
            let watcher = chokidar.watch(path.normalize(folder), this.defaultConfig);
            watcher.on('add', this.newFile);
            watcher.on('error', (error: Error) => {
                console.log(error);
            });
            watcher.on('ready', () => {
                console.log('ready');
            })
            this.watchers.push(watcher);
            // this.watchers.push(chokidar.watch(folder, this.defaultConfig).on('add', (data: any) => {
            //     this.newFile(data);
            // }));
        });
    }

    /**
     * Takes the defined categories and maps them so that we can easily know which extension file goes to which folder,
     * creates some data redundancy but gets rid of any lookup time if we want to know where a file should go
     */
    private mapCategories() {
        // let paths = Object.keys(categories)
        // let map: any = {};
        // paths.forEach((location) => {
        //     let extensions = categories[location];
        //     extensions.forEach((extension: string | number) => {
        //         map[extension] = location;
        //     });
        // });
        // return map;
    }

    private newFile(data: any) {
        console.log(data);
    }
}