var
  path = require('path'),
  Mocha = require('mocha'),
  utils = require('./../utils')

require('colors')

module.exports = function (reporter, callback) {
  console.log("System Tests".green + ": running...")

  var
    system_tests = path.join(__dirname, "..", "..", "test", "system"),
    runner = new Mocha({
      ui: "bdd",
      reporter: reporter || 'dot',
      timeout: 10000,
      slow: 8000
    })

  runner.files = utils.collect(system_tests)
  runner.run(function (failed) {
    if (failed !== 0) process.exit(1)
    callback ? callback() : complete()
  })

  jake.addListener('complete', function () {
    process.exit()
  })
}
