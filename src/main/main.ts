import { app, BrowserWindow, Tray, Menu, nativeImage, dialog } from 'electron';
import { MessageBoxOptions } from 'electron/main';
import * as path from 'path';

let isDevEnv = process && process.mainModule && process.mainModule.filename.indexOf('app.asar') == -1;
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

// Live reload for the render process, this validation makes sure to activate it only in development mode
if (isDevEnv) {
    // require('electron-reload')('dist/app');
}

function init() {
    win = createWindow();
    setTimeout(() => {
        win.show()
        win.focus();
    }, 1000);
    tray = createTray();
}

function createWindow(): BrowserWindow {
    // Create the browser window.
    win = new BrowserWindow({
        width: 910,
        height: 600,
        show: false,
        // frame: process.platform == 'darwin',
        maximizable: false,
        webPreferences: {
            devTools: isDevEnv,
            worldSafeExecuteJavaScript: true,
            nodeIntegration: true,
            enableRemoteModule: true
        },
        icon: path.join('favicon.ico')
    });
    win.removeMenu();

    // Path to index on the dist folder  
    win.loadURL(path.join("file://", __dirname, "./app/index.html"));
    if (isDevEnv) {
        win.webContents.toggleDevTools();
    }
    win.on('close', onWindowClose);

    if (process.platform == 'darwin') {
        app.dock.hide();
        // let iconPath = isDevEnv ?
        //     path.join(__dirname, '../', 'win-icon.png') : path.join(__dirname, '../../', 'win-icon.png');;
        // const image = nativeImage.createFromPath(iconPath);
        // app.dock.setIcon(image);
        
    }

    return win;
}


function onWindowClose(event: any) {
    // For testing porpuses we allow the close for OSX
    if (!isQuiting) {
        event.preventDefault();
        win.hide();
        return false;
    }
}

function createTray(): Tray {
    let iconPath = '';
    if (process.platform == 'darwin') {
        iconPath = isDevEnv ? 
            path.join(__dirname, '../', 'icon-16x.png') : path.join(__dirname, '../../', 'icon-16x.png');
    }
    else {
        iconPath = isDevEnv ?
            path.join('dist/app', 'favicon.ico') : path.join(__dirname, '../../', 'favicon.ico');
    }

    console.log(iconPath);
    let tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate(trayMenu);
    tray.setToolTip('Files sorter');
    tray.setContextMenu(contextMenu);
    tray.on('click', onTrayClick);
    return tray;
}

function onTrayClick() {
    win.show();
}

app.on('ready', init);