const { remote } = require("electron");
const { BrowserWindow } = remote;
const path = require('path')
const url = require('url');
const ipc = require('electron').ipcRenderer;
// const ipcMain = require('electron').ipcMain;
const { desktopCapturer } = require("electron");
import { takeScreenshot } from "./screencapture";
let win;

ipc.on('messageFromMain', (event, message) => {
  console.log(`This is the message from the second window sent via main: ${message}`);
  const pixels = JSON.parse(message).data;
  console.log(pixels, 'pixels selected');
  let rgbBox = document.getElementById('rgb-color-box');
  let rgbValues = document.getElementById('rgb-values');
  rgbValues.innerHTML = `rgba(${pixels[0]},${pixels[1]}, ${pixels[2]}, ${pixels[3]})`
  rgbBox.style.display = "inline-block";
  rgbBox.style.backgroundColor = `rgba(${pixels[0]},${pixels[1]}, ${pixels[2]}, ${pixels[3]})`
  win.setSimpleFullScreen(false);


  // document.write(`<div style="background-color: rgba(${pixels[0]},${pixels[1]}, ${pixels[2]}, ${pixels[3]}); border: solid 1px; padding: 10px"></div>`);
});
module.exports = {
  pick: () => {
    desktopCapturer.getSources({ types: ["screen"] }, (error, sources) => {
      if (error) throw error;

      takeScreenshot({
        sourceId: sources[0].id.replace("screen:", "")
      }).then(result => {
          win = new BrowserWindow({
          transparent: true,
          frame: false,
          toolbar: true,

          // fullscreen: true
        });
        win.setSimpleFullScreen(true);
        win.show();
        // console.log(__dirname, "dirname");


        win.loadURL(path.join('file://', process.cwd(), 'src/screenshot.html'));

        // win.show();
        // win.webContents.openDevTools();
        win.webContents.on('did-finish-load', () => {
          win.webContents.send('screenshot', result)
        });
        // win.on('close', function () {
        //   // Dereference the window object, usually you would store windows
        //   // in an array if your app supports multi windows, this is the time
        //   // when you should delete the corresponding element.
        //   win = null
        // })
        win.on('close', function (e) {
          e.preventDefault();
          if(win.isFullScreen()){
              win.once('leave-full-screen', function () {
                  win.hide();
              })
              win.setFullScreen(false);
          }
          else{
              win.hide();
          }
      });
      });

      });
  }
}
