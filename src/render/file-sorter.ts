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
    }

    /**
     * Updates local variable (this.paths) holding pre-processed folder data, data is pre-processed
     * and constantly updated to avoid lookup times when searching the right location for a new file
     */
    updateFoldersData(data?: any) {
        if (!data) {
            let raw: string | null = localStorage.getItem('folders');
            if (raw) data = JSON.parse(raw);
        }
        this.paths = data;
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
        await fs.readdir(folder, { withFileTypes: true }, (err, dirents) => {
            if (err) {
                return;
            }
            dirents.map(async dirent => {
                if (dirent.isFile()) {
                    await this.sort(folder, path.resolve(folder, dirent.name));
                }
            });
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

        let category = this.getCategory(data, name);

        if (!category) {
            return;
        }
        // let category = data.mappedCategories[extension];
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

    private getCategory(data: any, name: string): string | null {
        let categories = data.categories;
        let order = data.order;
        let found = false;
        let category = null;

        for (let i = 0; i < order.length; i++) {
            let rules = categories[order[i]];
            for (let j = 0; j < rules.length; j++) {
                let rule = rules[j];
                if (this.checkRule(rule, name)) {
                    found = true;
                    category = order[i];
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        return category;
    }

    private checkRule(rule: string, name: string): boolean {
        let result = false;
        let split = rule.split(':');
        let condition = split[0];
        let value = split[1];

        switch (condition) {
            case 'starts_with':
                result = name.indexOf(value) == 0;
                break;
            case 'contains':
                result = name.indexOf(value) > -1;
                break;
            case 'ends_with':
                result = name.indexOf(value) == name.length - value.length
                break;
        }
        
        return result;
    }
}