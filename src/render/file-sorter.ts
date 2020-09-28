import chokidar from 'chokidar';
import  path from 'path';
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
        ignoreInitial: true

    };
    watchers: any = {};

    constructor () {
        // this.updateFoldersData();
        // this.defineWatchers(this.paths);
    }

    updateFoldersData() {
        let data = {};
        let raw: string | null = localStorage.getItem('folders');
        if (raw) {
            data = JSON.parse(raw);
        }
        this.paths = data;
        this.mapFolders(this.paths);
    }

    addWatcher(folder: string) {
        let watcher = chokidar.watch(folder, this.defaultConfig);
        watcher.on('add', (location: any) => {
            this.newFile(folder, location)
        });
        this.watchers[folder] = watcher;
    }

    deleteWatcher(folder: string) {
        if (!this.watchers[folder]) {
            return;
        }

        this.watchers[folder].close();
        delete this.watchers[folder];
    } 

    private mapFolders(folders: any) {
        let keys = Object.keys(folders);
        keys.forEach((folder) => {
            let data = this.paths[folder];
            if (data.categories && this.paths[folder]) {
                this.paths[folder].mappedCategories = this.mapCategories(data.categories);
            }
        });
    }

    /**
     * Takes the defined categories and maps them so that we can easily know which extension file goes to which folder,
     * creates some data redundancy but gets rid of any lookup time if we want to know where a file should go
     */
    private mapCategories(categories: any) {
        let keys = Object.keys(categories)
        let map: any = {};
        keys.forEach((category: any) => {
            let extensions = categories[category];
            extensions.forEach((extension: any) => {
                map[extension.toLocaleLowerCase()] = category;
            });
        });
        return map;
    }

    private defineWatchers(paths: any) {
        let folders = Object.keys(paths);
        folders.map((folder) => {
            this.addWatcher(folder);
        });
    }

    private newFile(folder: string, location: string) {
        let data = this.paths[folder];
        let name: any = path.basename(location)	
        let extension = name.split('.').pop().toLocaleLowerCase();

        if (!data.mappedCategories[extension]) {
            return;
        }

        let category = data.mappedCategories[extension];
        let destination = path.resolve(folder, category);
        

        if (!destination) {
            return
        }

        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
        }

        destination = path.resolve(destination, name);
        if (destination.toLocaleLowerCase() != location.toLocaleLowerCase()) {
            console.log('renaming: ' + location + ' to: ' + destination);
            fs.renameSync(location, destination);
        }
    }
}