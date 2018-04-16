'use strict';

var _pick = require('./pick');

var _pick2 = _interopRequireDefault(_pick);

var _ipcMainHandler = require('./ipcMainHandler');

var _ipcMainHandler2 = _interopRequireDefault(_ipcMainHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_pick2.default, _ipcMainHandler2.default);
// exports.pick = pick;
// exports.ipcMainHandler = ipcMainHandler;
module.exports = {
  pick: _pick2.default,
  ipcMainHandler: _ipcMainHandler2.default
};