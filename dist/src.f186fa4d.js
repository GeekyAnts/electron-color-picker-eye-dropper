process.env.HMR_PORT=53178;process.env.HMR_HOSTNAME="localhost";// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({3:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.captureVideo = exports.takeScreenshot = undefined;

var _recordrtc = require("recordrtc");

var _recordrtc2 = _interopRequireDefault(_recordrtc);

var _electron = require("electron");

var _electron2 = _interopRequireDefault(_electron);

var _arrayFind = require("array-find");

var _arrayFind2 = _interopRequireDefault(_arrayFind);

var _lodash = require("lodash.findindex");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* This is NEEDED because RecordRTC is badly written */
global.html2canvas = function (canvas, obj) {
  obj.onrendered(canvas);
};

var getStream = function getStream(sourceId) {
  return new Promise(function (resolve, reject) {
    _electron.desktopCapturer.getSources({ types: ["screen"] }, function (error, sources) {
      if (error) {
        reject(error);
        return;
      }

      var display = getDisplay(sourceId);
      var displayIndex = (0, _lodash2.default)(_electron2.default.screen.getAllDisplays(), function (item) {
        return item.id == sourceId;
      });

      navigator.webkitGetUserMedia({
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
      }, resolve, reject);
    });
  });
};

var getVideo = function getVideo(stream) {
  var video = document.createElement("video");
  video.autoplay = true;
  video.src = URL.createObjectURL(stream);
  return new Promise(function (resolve) {
    video.addEventListener("playing", function () {
      resolve(video);
    });
  });
};

var getCanvas = function getCanvas(width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

var drawFrame = function drawFrame(_ref) {
  var ctx = _ref.ctx,
      video = _ref.video,
      x = _ref.x,
      y = _ref.y,
      width = _ref.width,
      height = _ref.height,
      _ref$availTop = _ref.availTop,
      availTop = _ref$availTop === undefined ? screen.availTop : _ref$availTop;

  ctx.drawImage(video, x, y, width, height, 0, -availTop, width, height);
};

var getFrameImage = function getFrameImage(canvas) {
  return canvas.toDataURL();
};

var getDisplay = function getDisplay(id) {
  var x = (0, _arrayFind2.default)(_electron2.default.screen.getAllDisplays(), function (item) {
    console.log(item.id, id);
    return item.id == id;
  });

  return x;
};

var getLoop = function getLoop(fn) {
  var requestId = void 0;
  var callFn = function callFn() {
    requestId = requestAnimationFrame(callFn);
    fn();
  };
  callFn();
  return function () {
    cancelAnimationFrame(requestId);
  };
};

var startRecording = function startRecording(_ref2) {
  var canvas = _ref2.canvas,
      video = _ref2.video,
      x = _ref2.x,
      y = _ref2.y,
      width = _ref2.width,
      height = _ref2.height,
      availTop = _ref2.availTop;

  var recorder = (0, _recordrtc2.default)(canvas, { type: "canvas" });
  var ctx = canvas.getContext("2d");
  var stopLoop = getLoop(function () {
    return drawFrame({ ctx: ctx, video: video, x: x, y: y, width: width, height: height, availTop: availTop });
  });

  recorder.startRecording();

  return {
    stop: function stop() {
      return new Promise(function (resolve) {
        stopLoop();
        recorder.stopRecording(function () {
          recorder.getDataURL(function (url) {
            return resolve({ url: url, width: width, height: height });
          });
        });
      });
    },
    pause: function pause() {
      recorder.pauseRecording();
    },
    resume: function resume() {
      recorder.resumeRecording();
    }
  };
};

var takeScreenshot = exports.takeScreenshot = function takeScreenshot(_ref3) {
  var x = _ref3.x,
      y = _ref3.y,
      width = _ref3.width,
      height = _ref3.height,
      sourceId = _ref3.sourceId;

  //const availTop = screen.availTop - getDisplay(sourceId).bounds.y;

  var display = getDisplay(sourceId);

  if (typeof x == "undefined") x = display.bounds.x;
  if (typeof y == "undefined") y = display.bounds.y;
  if (typeof width == "undefined") width = display.bounds.width;
  if (typeof height == "undefined") height = display.bounds.height;

  var availTop = 0;

  return getStream(sourceId).then(getVideo).then(function (video) {
    var canvas = getCanvas(width, height);
    var ctx = canvas.getContext("2d");
    drawFrame({ ctx: ctx, video: video, x: x, y: y, width: width, height: height, availTop: availTop });
    return getFrameImage(canvas);
  });
};

var captureVideo = exports.captureVideo = function captureVideo(_ref4) {
  var x = _ref4.x,
      y = _ref4.y,
      width = _ref4.width,
      height = _ref4.height,
      sourceId = _ref4.sourceId;

  var availTop = screen.availTop - getDisplay(sourceId).bounds.y;
  return getStream(sourceId).then(getVideo).then(function (video) {
    var canvas = getCanvas(width, height);
    return startRecording({ canvas: canvas, video: video, x: x, y: y, width: width, height: height, availTop: availTop });
  });
};
},{}],5:[function(require,module,exports) {
'use strict';

var _screencapture = require('./screencapture');

var _require = require("electron"),
    remote = _require.remote;
// var robot = require ("robot-js");


var ipcMain = require('electron').ipcMain;
var BrowserWindow = remote.BrowserWindow;

var path = require('path');
var url = require('url');
var ipc = require('electron').ipcRenderer;
// const ipcMain = require('electron').ipcMain;

var _require2 = require("electron"),
    desktopCapturer = _require2.desktopCapturer;

console.log(ipcMain, 'ipc');

var win = void 0;
exports.pick = function () {
  return new Promise(function (resolve, reject) {

    desktopCapturer.getSources({ types: ["screen"] }, function (error, sources) {
      if (error) throw error;

      (0, _screencapture.takeScreenshot)({
        sourceId: sources[0].id.replace("screen:", "")
      }).then(function (result) {
        win = new BrowserWindow({
          transparent: true,
          frame: false,
          toolbar: true
        });
        win.setSimpleFullScreen(true);
        win.show();
        win.loadURL(path.join('file://', process.cwd(), 'src/screenshot.html'));
        win.webContents.on('did-finish-load', function () {
          win.webContents.send('screenshot', result);
        });
      });
    });
    // win.on('closed', () => {
    //   win = null
    // })
    ipc.on('clickedPixels', function (event, message) {
      var pixels = JSON.parse(message).data;
      console.log(pixels, 'pixels selected');
      var rgbBox = document.getElementById('rgb-color-box');
      var rgbValues = document.getElementById('rgb-values');
      rgbValues.innerHTML = 'rgba(' + pixels[0] + ',' + pixels[1] + ', ' + pixels[2] + ', ' + pixels[3] + ')';
      rgbBox.style.display = "inline-block";
      rgbBox.style.backgroundColor = 'rgba(' + pixels[0] + ',' + pixels[1] + ', ' + pixels[2] + ', ' + pixels[3] + ')';
      resolve(pixels);
    });
  });
};
},{"./screencapture":3}],6:[function(require,module,exports) {
'use strict';

var ipc = require('electron').ipcMain;

exports.ipcMainHandler = function (win) {
  ipc.on('clickedPixels', function (event, message) {
    win.webContents.send('clickedPixels', JSON.stringify(message));
  });
};
},{}],4:[function(require,module,exports) {
'use strict';

var _require = require('./pick'),
    pick = _require.pick;

var _require2 = require('./ipcMainHandler'),
    ipcMainHandler = _require2.ipcMainHandler;

exports.pick = pick;
exports.ipcMainHandler = ipcMainHandler;
},{"./pick":5,"./ipcMainHandler":6}],2:[function(require,module,exports) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _src = require("../../src");

var _src2 = _interopRequireDefault(_src);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("electron"),
    desktopCapturer = _require.desktopCapturer;

var _require2 = require("../../src/screencapture"),
    takeScreenshot = _require2.takeScreenshot;

var Demo = function (_Component) {
  _inherits(Demo, _Component);

  function Demo() {
    _classCallCheck(this, Demo);

    var _this = _possibleConstructorReturn(this, (Demo.__proto__ || Object.getPrototypeOf(Demo)).call(this));

    _this.state = {
      img: ""
    };
    _this.attach = _this.attach.bind(_this);
    return _this;
  }

  _createClass(Demo, [{
    key: "attach",
    value: function attach() {
      _src2.default.pick().then(function (r) {
        return console.log(r, "resp");
      });
    }
  }, {
    key: "render",
    value: function render() {
      console.log("inside main render");
      return _react2.default.createElement(
        "div",
        { style: { flex: 1 } },
        _react2.default.createElement("img", { src: this.state.img }),
        _react2.default.createElement(
          "h1",
          null,
          "color-eye-dropper Demo"
        ),
        _react2.default.createElement(
          "button",
          { type: "button", onClick: this.attach },
          "Pick Color"
        ),
        _react2.default.createElement(
          "div",
          { style: { margin: '10px' } },
          _react2.default.createElement("div", { id: "rgb-color-box", style: { border: "solid 1px", padding: "15px", display: "none" } }),
          _react2.default.createElement("p", { id: "rgb-values" })
        )
      );
    }
  }]);

  return Demo;
}(_react.Component);

(0, _reactDom.render)(_react2.default.createElement(Demo, null), document.querySelector("#demo"));
},{"../../src":4,"../../src/screencapture":3}],7:[function(require,module,exports) {
var OVERLAY_ID = '__parcel__error__overlay__';

var global = (1, eval)('this');
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = process.env.HMR_HOSTNAME || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + process.env.HMR_PORT + '/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = (
    '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' +
      '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' +
      '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' +
      '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' +
      '<pre>' + stackTrace.innerHTML + '</pre>' +
    '</div>'
  );

  return overlay;

}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id)
  });
}

},{}]},{},[7,2])
//# sourceMappingURL=src.f186fa4d.map