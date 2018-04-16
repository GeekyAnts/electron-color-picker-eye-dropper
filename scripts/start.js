const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const ipc = require('electron').ipcMain;
const ipcMainHandler = require( '../src/ipcMainHandler');
let win;

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
  ipcMainHandler(win)
}

app.on("ready", createWindow);
