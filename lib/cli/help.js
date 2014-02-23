var
  fs = require('fs'),
  path = require('path'),
  logger = require('./../logger'),
  cli_doc = path.join(__dirname, '..', '..', 'doc', 'lib', 'cli')

function help(subcmd) {
  var
    help_file = path.join(cli_doc, (subcmd || 'help') + '.md'),
    log = logger.create('cli')

  fs.readFile(help_file, 'utf-8', function (err, data) {
    if (err) {
      log.error(err)
      log.error('The help file for the specified command name may not exist.')
    } else {
      console.log(data)
    }
  })
}

module.exports = {
  default: help,
  help: help
}
