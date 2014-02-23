var
  path = require('path'),
  child_process = require('child_process'),
  express = require('express'),
  istanbul = path.join(__dirname, "..", "..", "node_modules", ".bin", "istanbul"),
  lcov_report = path.join(__dirname, "..", "..", "coverage", "lcov-report"),
  port = 4002

require('colors')

function test_with_cov(type) {
  var args = ("cover -x **/tasks/** jake -- test:" + (type || "all")).split(" ")

  // TODO: don't spawn for system.. just spawn regular with ENV variable set
  child_process
    .spawn(istanbul, args, {stdio: "inherit"})
    .on("exit", function () {
      express()
        .use(express.static(lcov_report))
        .listen(port)

      console.log()
      console.log("lcov".green + " report ready.")
      console.log("  listening on: " + ("http://localhost:" + port).green)
      console.log()
      console.log("Note".red + ": this does not include system tests.")
    })
}

module.exports = test_with_cov
