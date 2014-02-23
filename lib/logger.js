var
  minilog = require('minilog'),
  fs = require('fs'),
  not_setup = true

function setup() {
  if (process.env.LOGFILE) {
    minilog.pipe(fs.createWriteStream(process.env.LOGFILE))
  } else {
    minilog.pipe(minilog.backends.nodeConsole.formatNpm)
           .pipe(minilog.backends.nodeConsole)
  }

  not_setup = false
}

function create(name) {
  if (not_setup) setup()
  return minilog.call(minilog, name)
}

module.exports = {
  create: create,
  setup: setup
}
