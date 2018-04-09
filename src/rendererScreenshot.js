
const ipc = require('electron').ipcRenderer;
const {remote} = require('electron');
const {BrowserWindow} = require('electron').remote;

ipc.on('screenshot', (event, base64Data) => {
  document.write(`<img id="screenshot-img"src="${base64Data}">`);

  document.addEventListener('click', (event) => clickHandler(event))
});

function clickHandler(event) {
  console.log("captured click event", event);
  var img = document.getElementById('screenshot-img');
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
  var pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data
  console.log(pixelData);

  ipc.send('reply', pixelData);

  var window = remote.getCurrentWindow();
  window.close();

  // window.unmaximize();
  // window.close();
}
// add color picker api.


