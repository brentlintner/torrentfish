var
  child_process = require('child_process'),
  bin = './bin/torrentfish'

function array_from(obj) {
  return Object.keys(obj).reduce(function (array, key) {
    return array.push(key), array.push(obj[key]), array
  }, [])
}

function strip_colouring(txt) {
  return txt.replace(/\u001b\[(\d\d;)?\d\d?m/gi, '')
}

function spawn(opts, callback, kill_on) {
  var
    proc = child_process.spawn(bin, array_from(opts)),
    err = '', out = '', int_id

  proc.stdout.on('data', function (d) { out += d })
  proc.stderr.on('data', function (d) { err += d })

  proc.on('close', function (code) {
    clearInterval(int_id)
    if (err) console.log(err)
    callback(code, strip_colouring(out), err)
  })

  process.on('exit', function () { proc.kill() })
  int_id = setInterval(function () { proc.kill() },
                       1000 * (kill_on || 3))

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
