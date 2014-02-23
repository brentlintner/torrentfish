var
  path = require('path'),
  fs = require('fs'),
  db = require('./db'),
  logger = require('./logger'),
  $ = require('./config'),
  poll = require('./daemon/poll')

function find_user_conf(opts) {
  var file = path.join(process.cwd(),
                       opts.w || opts.watchlist || $.torrentfish_config_file)
  return fs.existsSync(file) ? file : null
}

function monitor(opts) {
  if (!opts) opts = {}

  var
    log = logger.create('daemon'),
    url = opts.url,
    user_conf = find_user_conf(opts),
    interval = opts.interval || $.default_interval,
    email_interval = opts.email_interval || $.default_email_interval,
    db_name = path.join(process.cwd(), opts.db || $.default_db_name)

  if (!url) log.error('no feed url provided'), process.exit(1)
  if (!user_conf) log.error('could not find a user conf (with a watchlist)'), process.exit(1)

  eval("$.user = " + fs.readFileSync(user_conf, 'utf-8'))

  db.open(db_name, function (feeds_db) {
    poll.feed(url, feeds_db, {
      watchlist: $.user.watchlist,
      interval: interval,
      email_interval: email_interval
    })
  })
}

module.exports = {
  monitor: monitor
}
