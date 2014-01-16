var daemon = require('./../daemon')

function monitor(opts) {
  daemon.monitor(opts)
}

module.exports = {
  default: monitor
}
