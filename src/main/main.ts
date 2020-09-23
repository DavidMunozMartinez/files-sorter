import { app, BrowserWindow } from 'electron';
require('electron-reload')('dist/app');

function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Path to index on the dist folder   
    win.loadFile('app/index.html');
}

app.on('ready', createWindow);