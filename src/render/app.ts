let platform = require('electron-platform');
const {dialog} = require('electron').remote;
// import { dialog } from 'electron'

// let dialog = remote.require('electron').dialog;

if (!platform.isDarwin) {
    let titlebar = document.createElement('div');
    titlebar.id = 'electron-titlebar';
    titlebar.classList.add('drag');
    document.body.prepend(titlebar);
    require('electron-titlebar');
}

let folderInput = document.getElementsByClassName('folder-path')[0];
let folderButton = document.getElementsByClassName('add-folder')[0];
let folderSelector = document.getElementById('folder-selector');

folderButton.addEventListener('click', async () => {
    var path = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    folderInput.innerHTML = path.filePaths[0];
    // console.log(path.filePaths);
});

