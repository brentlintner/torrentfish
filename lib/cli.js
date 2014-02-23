var
  optimist = require('optimist'),
  help = require('./cli/help')

function interpret() {
  var
    argv = optimist.argv,
    cmd = argv._.length > 0 ? argv._[0] : 'daemon',
    subcmd = argv._.length > 1 ? argv._[1] : 'default'

  if (cmd == 'help') help.default(subcmd)
  else require('./cli/' + cmd)[subcmd](argv)
}

module.exports = {
  interpret: interpret
}
