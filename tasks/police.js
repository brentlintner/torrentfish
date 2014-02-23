var
  path = require('path'),
  police = path.join(__dirname, '..', 'node_modules', '.bin', 'police')

module.exports = function () {
  jake.exec([
    police + ' -lt package.json'
  ], {
    printStdout: true,
    printStderr: true
  }, complete)
}
