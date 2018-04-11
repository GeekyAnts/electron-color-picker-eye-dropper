

const { remote } = require("electron");
// var robot = require ("robot-js");

const { BrowserWindow } = remote;
const path = require('path')
const url = require('url');
const ipc = require('electron').ipcRenderer;
// const ipcMain = require('electron').ipcMain;
const { desktopCapturer } = require("electron");
import { takeScreenshot } from "./screencapture";
let win;
let pix;


module.exports = {
  pick: () => {
    return new Promise((resolve, reject) => {
      document.body.style.cursor = "none";

      desktopCapturer.getSources({ types: ["screen"] }, (error, sources) => {
        if (error) throw error;

        takeScreenshot({
          sourceId: sources[0].id.replace("screen:", "")
        }).then(result => {
            win = new BrowserWindow({
              transparent: true,
              frame: false,
              toolbar: true,
            });
            win.setSimpleFullScreen(true);
            win.show();
            win.loadURL(path.join('file://', process.cwd(), 'src/screenshot.html'));
            win.webContents.on('did-finish-load', () => {
              win.webContents.send('screenshot', result)
            });
          });
      });
      ipc.on('clickedPixels', (event, message) => {
        console.log(`This is the message from the second window sent via main: ${message}`);
        const pixels = JSON.parse(message).data;
        console.log(pixels, 'pixels selected');
        let rgbBox = document.getElementById('rgb-color-box');
        let rgbValues = document.getElementById('rgb-values');
        rgbValues.innerHTML = `rgba(${pixels[0]},${pixels[1]}, ${pixels[2]}, ${pixels[3]})`
        rgbBox.style.display = "inline-block";
        rgbBox.style.backgroundColor = `rgba(${pixels[0]},${pixels[1]}, ${pixels[2]}, ${pixels[3]})`
        win.setSimpleFullScreen(false);
        resolve(pixels);
      });

    });
  }
}
