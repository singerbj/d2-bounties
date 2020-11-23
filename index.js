const { app, BrowserWindow, session } = require('electron');

const createWindow = () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ['*']
            }
        })
    })

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    });
    win.loadFile('./dist/index.html');
};



app.whenReady().then(createWindow);
