
const ipc = require('electron').ipcRenderer;
const {remote} = require('electron');
const {BrowserWindow} = require('electron').remote;

ipc.on('screenshot', (event, base64Data) => {

  // document.body.style.padding = "0px";

  document.write(`<img id="screenshot-img"src="${base64Data}" style="position: absolute; top: 0; left: 0">`);
  document.body.style.cursor = 'url(eyedropper.cur), auto';
  // var zoomCanvas = document.createElement('canvas');
  // zoomCanvas.width = "50" ;
  // zoomCanvas.height = "50";
  // zoomCanvas.style.border = '1px solid';
  // zoomCanvas.style.backgroundColor = 'transparent';
  // zoomCanvas.style.position = "absolute";
  // console.log(zoomCanvas, "zoomCanvas")
  document.addEventListener('click', (event) => clickHandler(event))
  // zoomCanvas = document.getElementById('zoom-canvas');
//   document.addEventListener('mousemove', (e) => {
//     console.log(e.x);
//     zoomCanvas.style.left = (e.x + 20) + 'px';
//     zoomCanvas.style.top = (e.y + 20) + 'px';
//     console.log(zoomCanvas, "zoomCanvas1")
//     const ctx = zoomCanvas.getContext('2d');
//     ctx.drawImage(img, 0, 0);
//     img.style.display = 'none';

//     var img = document.getElementById('screenshot-img');
//     var canvas = document.createElement('canvas');
//     canvas.width = img.width;
//     canvas.height = img.height;
//     // console.log(canvas.getContext('2d'), "canvas");
//     canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
//     var pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 10, 10).data
//     console.log(pixelData);
//     ctx.putImageData(pixelData, 0, 0);
//     // ipc.send('zoomed', pixelData);
//     document.body.appendChild(zoomCanvas);
//   })
});

function clickHandler(event, canvas) {

  // console.log("captured click event", event);
  var img = document.getElementById('screenshot-img');
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  // console.log(canvas.getContext('2d'), "canvas");
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
  var pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data
  // console.log(pixelData);

  ipc.send('clickedPixels', pixelData);

  var window = remote.getCurrentWindow();
  window.setSimpleFullScreen(false);
  window.close();

  // window.unmaximize();
  // window.close();
}

