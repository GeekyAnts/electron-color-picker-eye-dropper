var {ipcMainHandler} = require('./ipcMainHandler');
var {pick} = require('./pick');

// console.log(pick, ipcMainHandler);
// exports.pick = pick;
// exports.ipcMainHandler = ipcMainHandler;
module.exports = {
  ipcMainHandler,
  pick
}
