import * as chokidar from 'chokidar';
import * as os from 'os';
import * as fs from 'fs'

// Default download path for windows
let path = `\\users\\${os.userInfo().username}\\downloads`;

// Make sure to get this data from a config file later
const categories: any = {
    'Images': ['png', 'jpg', 'gif'],
    'Executables/Installers': ['msi', 'exe']
}

let mappedCategories: any = mapCategories();

let watcher = chokidar.watch(path, {
    persistent: true,
    depth: 2,
    awaitWriteFinish: {
        stabilityThreshold: 0,
        pollInterval: 100
    },
    ignoreInitial: false
});

watcher.on('add', added);

/**
 * 
 * @param {string} origin Path of the new file, looks somthing like this: c:\users\user-name\downloads\filename.extension`
 */
function added(origin: string) {
    let name: any = origin.split('\\').pop();
    let extension = name.split('.').pop();
    let dest: any = {};

    // Validate of our extension has a defined category before we continue
    if (!mappedCategories[extension]) {
        return;
    }

    dest.dir = `${path}\\${mappedCategories[extension]}`; 
    dest.path = `${dest.dir}\\${name}`;

    // Moving the file triggers the 'add' event again, validate the paths to avoid executing logic twice
    if (dest.path && dest.path.toLowerCase() != origin.toLowerCase()) {
        // Validate that our destination exists
        if (dest && !fs.existsSync(dest.dir)) {
            fs.mkdirSync(dest.dir);
        }

        fs.renameSync(origin, dest.path);
    }
}

/**
 * Takes the defined categories and maps them so that we can easily know which extension file goes to which folder,
 * creates some data redundancy but gets rid of any lookup time if we want to know where a file should go
 */
function mapCategories() {
    let paths = Object.keys(categories)
    let map: any = {};
    paths.forEach((path) => {
        let extensions = categories[path];
        extensions.forEach((extension: string | number) => {
            map[extension] = path;
        });
    });
    return map;
}