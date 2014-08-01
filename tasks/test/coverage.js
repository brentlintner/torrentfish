var
  path = require('path'),
  shell = require('shelljs'),
  async = require('async'),
  child_process = require('child_process'),
  express = require('express'),
  cov_dir = path.join(__dirname, '..', '..', 'coverage'),
  istanbul = path.join(__dirname, "..", "..", "node_modules", ".bin", "istanbul"),
  jake = path.join(__dirname, "..", "..", "node_modules", ".bin", "jake")

require('colors')

function cleanup(callback) {
  shell.rm('-r', cov_dir)
  callback()
}

function run_unit(callback) {
  var args = ("cover -x **/tasks/** --dir coverage/unit jake -- test:unit").split(" ")
  child_process
    .spawn(istanbul, args, {stdio: "inherit"})
    .on("exit", callback)
}

function run_integration(callback) {
  var args = ("cover -x **/tasks/** --dir coverage/integration jake -- test:integration").split(" ")
  child_process
    .spawn(istanbul, args, {stdio: "inherit"})
    .on("exit", callback)
}

function run_system(callback) {
  // Note: see test/fixtures/cli for code that uses this
  process.env.TEST_COV = true

  child_process
    .spawn(jake, ["test:system[list]"], {
      stdio: "inherit",
      env: process.env
    })
    .on("exit", function (code) {
      console.log('Note:'.red + ' System test summary not viewable via terminal.')
      console.log()
      callback(code)
    })
}

function merge_reports(callback) {
  var args = ("report --dir coverage").split(" ")
  console.log("Merging".green + " any reports..")
  child_process
    .spawn(istanbul, args, {stdio: "inherit"})
    .on("exit", callback)
}

function serve_results(callback) {
  var
    lcov_report = path.join(__dirname, "..", "..", "coverage", "lcov-report"),
    port = 4002

  express()
    .use(express.static(lcov_report))
    .listen(port)

  console.log()
  console.log("lcov".green + " report ready.")
  console.log("  listening on: " + ("http://localhost:" + port).green)
  console.log()
  callback()
}

function send_to_coveralls(callback) {
  var cmd = "cat ./coverage/lcov.info | " +
            "./node_modules/.bin/coveralls"

  console.log("Sending lcov data to coveralls.io".green)

  child_process.exec(cmd, function (err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    if (err) throw err
    callback()
  })
}

function test_with_cov(type) {
  var cmds = [cleanup]

  if (type == 'unit') cmds.push(run_unit)
  else if (type == 'integration') cmds.push(run_integration)
  else if (type == 'system') cmds.push(run_system)
  else cmds = cmds.concat([run_unit, run_integration, run_system])

  cmds = cmds.concat([
    merge_reports,

    process.env.CI_BUILD ?
      send_to_coveralls :
      serve_results
  ])

  async.series(cmds)
}

module.exports = test_with_cov
