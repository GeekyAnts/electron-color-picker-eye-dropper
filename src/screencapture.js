import RecordRTC from "recordrtc";
import electron, { desktopCapturer } from "electron";
import find from "array-find";
import findIndex from "lodash.findindex";

/* This is NEEDED because RecordRTC is badly written */
global.html2canvas = (canvas, obj) => {
  obj.onrendered(canvas);
};

const getStream = sourceId => {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({ types: ["screen"] }, (error, sources) => {
      if (error) {
        reject(error);
        return;
      }

      const display = getDisplay(sourceId);
      const displayIndex = findIndex(
        electron.screen.getAllDisplays(),
        item => item.id == sourceId
      );

      navigator.webkitGetUserMedia(
        {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: sources[displayIndex].id,
              maxWidth: display.size.width,
              maxHeight: display.size.height,
              minWidth: display.size.width,
              minHeight: display.size.height
            }
          }
        },
        resolve,
        reject
      );
    });
  });
};

const getVideo = stream => {
  const video = document.createElement("video");
  video.autoplay = true;
  video.src = URL.createObjectURL(stream);
  return new Promise(resolve => {
    video.addEventListener("playing", () => {
      resolve(video);
    });
  });
};

const getCanvas = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const drawFrame = ({
  ctx,
  video,
  x,
  y,
  width,
  height,
  availTop = screen.availTop
}) => {
  ctx.drawImage(video, x, y, width, height, 0, -availTop, width, height);
};

const getFrameImage = canvas => {
  return canvas.toDataURL();
};

const getDisplay = id => {
  const x = find(electron.screen.getAllDisplays(), item => {
    console.log(item.id, id);
    return item.id == id;
  });

  return x;
};

const getLoop = fn => {
  let requestId;
  const callFn = () => {
    requestId = requestAnimationFrame(callFn);
    fn();
  };
  callFn();
  return () => {
    cancelAnimationFrame(requestId);
  };
};

const startRecording = ({ canvas, video, x, y, width, height, availTop }) => {
  const recorder = RecordRTC(canvas, { type: "canvas" });
  const ctx = canvas.getContext("2d");
  const stopLoop = getLoop(() =>
    drawFrame({ ctx, video, x, y, width, height, availTop })
  );

  recorder.startRecording();

  return {
    stop() {
      return new Promise(resolve => {
        stopLoop();
        recorder.stopRecording(() => {
          recorder.getDataURL(url => resolve({ url, width, height }));
        });
      });
    },
    pause() {
      recorder.pauseRecording();
    },
    resume() {
      recorder.resumeRecording();
    }
  };
};

export const takeScreenshot = ({ x, y, width, height, sourceId }) => {
  //const availTop = screen.availTop - getDisplay(sourceId).bounds.y;

  const display = getDisplay(sourceId);

  if (typeof x == "undefined") x = display.bounds.x;
  if (typeof y == "undefined") y = display.bounds.y;
  if (typeof width == "undefined") width = display.bounds.width;
  if (typeof height == "undefined") height = display.bounds.height;

  const availTop = 0;

  return getStream(sourceId)
    .then(getVideo)
    .then(video => {
      const canvas = getCanvas(width, height);
      const ctx = canvas.getContext("2d");
      drawFrame({ ctx, video, x, y, width, height, availTop });
      return getFrameImage(canvas);
    });
};

export const captureVideo = ({ x, y, width, height, sourceId }) => {
  const availTop = screen.availTop - getDisplay(sourceId).bounds.y;
  return getStream(sourceId)
    .then(getVideo)
    .then(video => {
      const canvas = getCanvas(width, height);
      return startRecording({ canvas, video, x, y, width, height, availTop });
    });
};
