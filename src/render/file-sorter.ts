import chokidar from 'chokidar';
import  path from 'path';
import * as fs from 'fs'

export class FileSorter {
    private paths: any;
    private defaultConfig = {
        persistent: true,
        depth: 0,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100
        },
        ignoreInitial: true

    };
    watchers: any = {};

    constructor () {
        this.updateFoldersData();
        this.defineWatchers(this.paths);
    }

    /**
     * Updates local variable (this.paths) holding pre-processed folder data, data is pre-processed
     * and constantly updated to avoid lookup times when searching the right location for a new file
     */
    updateFoldersData() {
        let data = {};
        let raw: string | null = localStorage.getItem('folders');
        if (raw) {
            data = JSON.parse(raw);
        }
        this.paths = data;
        this.mapFolders(this.paths);
    }

    /**
     * Adds a new chokidar watcher to the watchers object, each watcher triggers an event when a new file is detected
     * @param folder folder that will be observer
     */
    addWatcher(folder: string) {
        let watcher = chokidar.watch(folder, this.defaultConfig);
        watcher.on('add', (location: any) => {
            if(this.paths[folder].active) {
                this.sort(folder, location)
            }
        });
        this.watchers[folder] = watcher;
    }

    /**
     * Closes the chokidar watcher and deletes it from the watchers object
     * @param folder folder that will be deleted
     */
    deleteWatcher(folder: string) {
        if (!this.watchers[folder]) {
            return;
        }

        this.watchers[folder].close();
        delete this.watchers[folder];
    }

    /**
     * Reads all contents of a given folder path and applies its sorting rules to each file
     * @param folder Folder that will be sorted
     */
    async sortFolder (folder: string) {
        await fs.readdir(folder, (err, files) => {
            if (err) {
                return;
            }

            files.forEach(async (file) => {
                await this.sort(folder, path.resolve(folder, file));
            });
        });
    }

    /**
     * For each folder data, it creates a different object structure used to avoid lookup times when
     * trying to sort file types
     * @param folders Folders object from local storage
     */
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

    /**
     * Each folder path will be created as a chokidar watch instanse to detect new files
     * in the path
     * @param paths Folder paths to watch
     */
    private defineWatchers(paths: any) {
        let folders = Object.keys(paths);
        folders.map((folder) => {
            this.addWatcher(folder);
        });
    }

    /**
     * Executed when a new file is detected by a watcher, it makes sure to pick the right
     * plae for the new detected file and moves it to a constructed location based on the
     * folder rules
     * @param folder Path that triggered the sort action
     * @param location Absolute location for the new file
     */
    private async sort(folder: string, location: string) {
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
            await fs.mkdirSync(destination);
        }

        destination = await this.validateDestination(destination, name);

        if (fs.existsSync(location) && destination.toLocaleLowerCase() != location.toLocaleLowerCase()) {
            await fs.renameSync(location, destination);
        }
    }

    /**
     * Makes sure, if the file name already exists in the destination, renames the new file by adding
     * a number (starting from 1) and incrementally do this until the file name is unique to its destination
     * @param destination Destination to move the file
     * @param name File name (including extension)
     */
    private async validateDestination(destination: string, name: string): Promise<string> {
        let split = this.splitExtension(name);
        let fileName = split[0];
        let extension = split[1];

        let posible = path.resolve(destination, name);
        let exists = await fs.existsSync(posible);
        let increment = 1;
        while (exists) {
            let newName =`${fileName} (${increment}).${extension}`;
            posible = path.resolve(destination, newName);
            exists = await fs.existsSync(posible);
            increment += 1;
        }
        return posible;
    }

    /**
     * Splits the file into name and extension, taking into account scenarios where files contain dots in
     * their names
     * @param fileName File name (including extension)
     */
    private splitExtension (fileName: string): Array<string> {
        let split = fileName.split('.');
        let name = '';
        let extension = '';
        
        for (let i = 0; i <= split.length - 2; i++) {
            name += split[i];
            if (i + 1 <= split.length - 2) {
                name += '.';
            }
        }

        extension = split[split.length - 1];

        return [name, extension];
    }
}