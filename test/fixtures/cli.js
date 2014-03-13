var
  path = require('path'),
  child_process = require('child_process'),
  istanbul = path.join(__dirname, "..", "..", "node_modules", ".bin", "istanbul"),
  bin = './bin/torrentfish',
  tests_run = 0

function array_from(obj) {
  return Object.keys(obj).reduce(function (array, key) {
    return array.push(key), array.push(obj[key]), array
  }, [])
}

function strip_colouring(txt) {
  return txt.replace(/\u001b\[(\d\d;)?\d\d?m/gi, '')
}

function test_cov_prefix_args(bin) {
  return ('cover -x **/tasks/** --report lcovonly --print none ' +
         '--dir coverage/system/' + tests_run +
         ' ' + bin + ' --').split(' ')
}

function spawn(opts, callback) {
  // Note: see bin/torrentfish for code that uses this
  process.env.TEST_KILL_AFTER = 3 * 1000

  var
    err = '', out = '', int_id,
    proc = child_process.spawn(process.env.TEST_COV ? istanbul : bin,
                               (process.env.TEST_COV ? test_cov_prefix_args(bin) : [])
                                 .concat(array_from(opts)),
                                 {env: process.env})

  proc.stdout.on('data', function (d) { out += d })
  proc.stderr.on('data', function (d) { err += d })

  proc.on('close', function (code) {
    if (err) console.log(err)
    tests_run++
    clearInterval(int_id)
    callback(code, strip_colouring(out), err)
  })

  return proc
}

function exec(opts, callback) {
  var cmd = bin + ' ' + array_from(opts).join(' ')
  child_process.exec(cmd, callback)
}

module.exports = {
  spawn: spawn,
  exec: exec
}
