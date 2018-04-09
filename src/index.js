const { remote } = require("electron");
const { BrowserWindow } = remote;

const { desktopCapturer } = require("electron");
import { takeScreenshot } from "./screencapture";

module.exports = {
  say: () => {
    desktopCapturer.getSources({ types: ["screen"] }, (error, sources) => {
      if (error) throw error;

      takeScreenshot({
        sourceId: sources[0].id.replace("screen:", "")
      }).then(result => {
        const win = new BrowserWindow({
          transparent: true,
          frame: false,
          toolbar: false
        });
        win.maximize();
        win.setSimpleFullScreen(true);

        //        this.setState({ img: result });
      });
      //      const image = sources[0].thumbnail;
      //      this.setState({ img: image.toDataURL() });
    });

    /*

 */
  }
};
