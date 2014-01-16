var
  minilog = require('minilog'),
  fs = require('fs')

if (process.env.LOGFILE) {
  minilog.pipe(fs.createWriteStream(process.env.LOGFILE))
} else {
  minilog.pipe(minilog.backends.nodeConsole.formatNpm)
         .pipe(minilog.backends.nodeConsole)
}

function create(name) {
  // Important: call is used specifically for unit testing
  return minilog.call(minilog, name)
}

module.exports = {
  create: create
}
