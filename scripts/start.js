const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const ipc = require('electron').ipcMain;

let win;
ipc.on('clickedPixels', (event, message) => {
  console.log(`This is the message from the second window sent via main: ${JSON.stringify(message)}`);
  win.webContents.send('clickedPixels', JSON.stringify(message));
});

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "./../demo/dist/index.html"),
      protocol: "file:",
      slashes: true
    })
  );
}

app.on("ready", createWindow);
