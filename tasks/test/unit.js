var
  path = require('path'),
  Mocha = require('mocha'),
  utils = require('./../utils'),
  unit_tests = path.join(__dirname, "..", "..", "test", "unit")

require('colors')

module.exports = function (reporter, callback) {
  console.log("Unit Tests".green + ": running...")

  var runner = new Mocha({
    ui: "bdd",
    reporter: reporter || 'spec'
  })

  runner.files = utils.collect(unit_tests)
  runner.run(function (failed) {
    if (failed !== 0) process.exit(failed)

    callback ?
      callback() :
      complete()
  })

  jake.addListener('complete', function () {
    process.exit()
  })
}
