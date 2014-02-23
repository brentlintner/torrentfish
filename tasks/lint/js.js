var
  path = require('path'),
  jshint = path.join(__dirname, '..', '..' , 'node_modules', '.bin', 'jshint')

module.exports = function () {
  jake.exec([jshint + ' .'], {
    printStdout: true,
    printStderr: true,
    breakOnError: true
  }, complete)
}
