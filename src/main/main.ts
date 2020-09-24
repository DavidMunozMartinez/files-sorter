import { app, BrowserWindow, Tray, Menu } from 'electron';
// Live reload for the render process
require('electron-reload')('dist/app');

// let win = null;
let isQuiting = false;
let win: BrowserWindow;
let tray: Tray;

function init() {
    win = createWindow();
    tray = createTray();
}

function createWindow(): BrowserWindow {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Path to index on the dist folder   
    win.loadFile('app/index.html');
    win.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault();
            win.hide();
            return false;
        }
    });
    return win;
}

function createTray(): Tray { 
    let tray = new Tray('favicon.ico');
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click: () => {
                isQuiting = true;
                app.quit();
            }
        },
    ])
    tray.setToolTip('Files sorter.');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        win.show();
    })

    return tray;
}

app.on('ready', init);