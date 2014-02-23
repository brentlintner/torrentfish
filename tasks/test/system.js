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
      reporter: reporter || 'spec',
      timeout: 10000,
      slow: 5000
    })

  runner.files = utils.collect(system_tests)
  runner.run(callback || complete)

  jake.addListener('complete', function () {
    process.exit()
  })
}
