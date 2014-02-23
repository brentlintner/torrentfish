var daemon = require('./../daemon')

function elongate_option(short, long, opts) {
  if (opts.hasOwnProperty(short)) {
    opts[long] = opts[short]
    delete opts[short]
  }
}

function monitor(opts) {
  elongate_option('u', 'url', opts)
  elongate_option('i', 'interval', opts)
  elongate_option('e', 'email_interval', opts)
  elongate_option('w', 'watchlist', opts)

  daemon.monitor(opts)
}

module.exports = {
  default: monitor,
  monitor: monitor
}
