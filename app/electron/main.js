const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: { nodeIntegration: true }
    });

    win.loadURL('http://localhost:4000');
}

app.whenReady().then(createWindow);