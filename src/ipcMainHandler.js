
  const ipc = require('electron').ipcMain;

  ipcMainHandler = function (win) {
    ipc.on('clickedPixels', (event, message) => {
      win.webContents.send('clickedPixels', JSON.stringify(message));
    })
  };

export default ipcMainHandler;

