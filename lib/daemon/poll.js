var
  parser = require('./../parser'),
  logger = require('./../logger'),
  digest = require('./digest'),
  interval = setInterval

function h_to_ms(hours) {
  return hours * 60 * 60 * 1000
}

function matches_all(regexps, item) {
  return regexps.reduce(function (prev, match) {
    return prev && match.test(item.title)
  }, true)
}

function check(url, feeds_db, watchlist) {
  parser.scrape(url, function (err, item) {
    var log = logger.create('poll')

    if (err) return log.error(err) // TODO: do something later
    if (!watchlist) return

    Object.keys(watchlist).forEach(function (match_key) {
      if (matches_all(watchlist[match_key], item) &&
          !feeds_db.get(item.title)) {
        feeds_db.set(item.title, {link: item.link, notified: false})
        log.info('added - ' + item.title)
      }
    })
  })
}

function poll_feed(url, feeds_db, opts) {
  if (!opts) opts = {}
  var log = logger.create('poll')

  log.info('beginning poll')
  log.info('  check interval: ' + opts.interval + 'h')
  log.info('  email interval: ' + opts.email_interval + 'h')

  function check_feeds() {
    log.info('checking feeds - ' + new Date().toString())
    check(url, feeds_db, opts.watchlist)
  }

  process.nextTick(check_feeds)
  interval(check_feeds, h_to_ms(opts.interval))
  interval(function () { digest.send(feeds_db) },
           h_to_ms(opts.email_interval))
}

module.exports = {
  feed: poll_feed
}
