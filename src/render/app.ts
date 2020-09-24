let platform = require('electron-platform');
const { dialog } = require('electron').remote;


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

let folderInput = document.getElementsByClassName('folder-path')[0];
let folderButton = document.getElementsByClassName('add-folder')[0];
let folderSelector = document.getElementById('folder-selector');

folderButton.addEventListener('click', async () => {
    var path = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if (path.filePaths.length > 0) {
        folderInput.innerHTML = path.filePaths[0];
    }
});

