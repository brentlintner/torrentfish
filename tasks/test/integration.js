// TODO: DRY (unit.js is same)
var
  path = require('path'),
  Mocha = require('mocha'),
  utils = require('./../utils'),
  integration_tests = path.join(__dirname, "..", "..", "test", "integration")

require('colors')

module.exports = function (reporter, callback) {
  console.log("Integration Tests".green + ": running...")

  var runner = new Mocha({
    ui: "bdd",
    reporter: reporter || 'dot',
    timeout: 6000
  })

  runner.files = utils.collect(integration_tests)
  runner.run(function (failed) {
    if (failed !== 0) process.exit(1)
    callback ? callback() : complete()
  })

  jake.addListener('complete', function () {
    process.exit()
  })
}
