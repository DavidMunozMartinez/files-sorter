import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
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
        width: 850,
        height: 600,
        frame: process.platform == 'darwin',
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    // Path to index on the dist folder   
    win.loadFile('app/index.html');
    win.webContents.toggleDevTools();
    win.on('close', onWindowClose);
    
    return win;
}


function onWindowClose(event: any) {
    // For testing porpuses we allow the close for OSX
    if (!isQuiting && process.platform != 'darwin') {
        event.preventDefault();
        win.hide();
        return false;
    }
}

function createTray(): Tray { 
    let iconPath = path.join('favicon.ico')
    let tray = new Tray(nativeImage.createFromPath(iconPath));
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