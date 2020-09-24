import { app, BrowserWindow, Tray, Menu } from 'electron';
// Live reload for the render process
require('electron-reload')('dist/app');

// let win = null;
let isQuiting = false;
let win: BrowserWindow;
let tray: Tray;
let trayMenu = [
    {
        label: 'Quit',
        click: () => {
            isQuiting = true;
            app.quit();
        }
    }
];

function init() {
    win = createWindow();
    tray = createTray();
}

function createWindow(): BrowserWindow {
    // Create the browser window.
    win = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    // Path to index on the dist folder   
    win.loadFile('app/index.html');
    win.on('close', onWindowClose);
    
    return win;
}


function onWindowClose(event: any) {
    if (!isQuiting) {
        event.preventDefault();
        win.hide();
        return false;
    }
}

function createTray(): Tray { 
    let tray = new Tray('favicon.ico');
    const contextMenu = Menu.buildFromTemplate(trayMenu);
    tray.setToolTip('Files sorter.');
    tray.setContextMenu(contextMenu);
    tray.on('click', onTrayClick);
    return tray;
}

function onTrayClick() {
    win.show();
}

app.on('ready', init);