var
  parser = require('./../parser'),
  logger = require('./../logger'),
  digest = require('./digest')

function h_to_ms(hours) {
  return hours * 60 * 60 * 1000
}

function matches_all(regexps, item) {
  return regexps.reduce(function (prev, match) {
    return prev && match.test(item.title)
  }, true)
}

function check(url, feeds_db, watchlist) {
  parser.scrape(url, function (item) {
    var log = logger.create('poll')

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
  setInterval(check_feeds, h_to_ms(opts.interval))
  setInterval(function () { digest.send(feeds_db) },
              h_to_ms(opts.email_interval))
}

module.exports = {
  feed: poll_feed
}
