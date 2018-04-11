
  const ipc = require('electron').ipcMain;

  exports.ipcMainHandler = function (win) {
    ipc.on('clickedPixels', (event, message) => {
      win.webContents.send('clickedPixels', JSON.stringify(message));
    })
  };

