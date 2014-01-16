var
  optimist = require('optimist'),
  help = require('./cli/help')

function interpret() {
  var
    argv = optimist.argv,
    cmd = argv._.length > 0 ? argv._[0] : 'daemon'

  if (cmd == 'help') {
    help['default']()
  } else {
    require('./cli/' + cmd)['default'](argv)
  }
}

module.exports = {
  interpret: interpret
}
