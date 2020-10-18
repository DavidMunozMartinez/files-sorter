import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
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
        icon: path.join(__dirname, '../', getIcon(512))
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
        let skips = isDevEnv ? '../' : '../../';
        let iconPath = path.join(__dirname, skips, getIcon(512))
        app.dock.setIcon(iconPath);
    }

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
    let iconPath = '';
    if (isDevEnv) {
        iconPath = path.join(__dirname, '../', getIcon(32))
    }
    else {
        iconPath = path.join(__dirname, '../../', getIcon(32));
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

function getIcon(res: number) {
    return `icons/icon-fs-@${res}px.png`;
}

app.on('ready', init);