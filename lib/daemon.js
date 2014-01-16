var
  path = require('path'),
  db = require('./db'),
  parser = require('./parser'),
  logger = require('./logger'),
  mailer = require('./mailer'),
  conf = require('./config'),
  log = logger.create('daemon')

// TODO: A lot of this logic should be per-parser and/or per-domain

function email_found(feeds) {
  function into_html_digest(html, item) {
    var fragment = '<a href="' + item.link + '">' + item.title + '</a></br></br>'
    return html + '<br/>' + fragment
  }

  function by_title(a, b) {
    var
      t_a = a.title.toLowerCase(),
      t_b = b.title.toLowerCase()
    return t_a < t_b ? -1 : (t_a > t_b ? 1 : 0)
  }

  log.info('checking for any titles yet to be emailed')

  feeds.get(function (err, doc) {
    var digest = []

    if (err) (log.error(err), process.exit(1))

    Object.keys(doc).forEach(function (key) {
      if (doc[key].notified) return
      doc[key].notified = true
      digest.push({title: key, link: doc[key].link})
    })

    if (digest.length === 0) return

    mailer.send({
      subject: "TorrentDay Watchlist Digest",
      html: digest.sort(by_title)
                  .reduce(into_html_digest,
                          '<p>Here are some things that are of interest.</p>')
    }, function (err, res) {
      if (err) (log.error(err), process.exit(1))

      log.info("email sent - response: " + res.message)

      feeds.save(doc, function (err) {
        if (err) (log.error(err), process.exit())
      })
    })
  })
}

function check(url, watchlist, feeds) {
  log.info('checking feeds')

  parser.scrape(url, function (item) {
    Object.keys(watchlist).forEach(function (match_key) {
      if (watchlist[match_key].reduce(function (prev, match) {
        return prev && match.test(item.title)
      }, true)) {
        feeds.get(function (err, obj) {
          if (obj.hasOwnProperty(item.title)) return

          obj[item.title] = {link: item.link, notified: false}

          feeds.save(obj, function (err) {
            if (!err) log.info('added - ' + item.title)
            else log.error(err)
          })
        })
      }
    })
  })
}

function poll_feed(url, watchlist, interval, email_interval, feeds) {
  function poll_start() {
    log.info('beginning poll')
    log.info('  check interval: ' + interval + 'h')
    log.info('  email interval: ' + email_interval + 'h')

    setInterval(check.bind(null, url, watchlist, feeds), (interval * 60 * 60 * 1000))
    setInterval(email_found.bind(null, feeds), (email_interval * 60 * 60 * 1000))
    process.nextTick(check.bind(null, url, watchlist, feeds))
  }

  feeds.get(function (err/*, obj*/) {
    if (err && err.toString().match(/document does not exist/i)) {
      log.warn('Error handled- non-existent document- initializing a new one.')
      feeds.save({}, poll_start)
    } else { process.nextTick(poll_start) }
  })
}

function find_watchlist(opts) {
  return (opts.w || opts.watchlist) ?
           require(path.join("..", opts.w || opts.watchlist)) :
           require(path.join(process.cwd(), conf.torrentfish_config_file))
}

// TODO: match against categories! (add support to .torrentfish.js file)
function monitor(opts) {
  if (!opts) opts = {}

  var
    watchlist = find_watchlist(opts),
    interval = opts.i || opts.interval || conf.default_interval,
    email_interval = opts.e || opts.email || parseInt(conf.default_interval * 3, 10),
    url = opts.u || opts.url,
    db_conn = opts.db || path.join(process.cwd(), conf.default_db_name),
    feeds_doc_key = 'feeds-notified',
    feeds

  if (!url) log.error('no feed url provided') && process.exit()

  feeds = db.open(db_conn, function () {
    mailer.setup(function () {
      poll_feed(url, watchlist, interval, email_interval, feeds)
    })
  })

  feeds.get = feeds.get.bind(feeds, feeds_doc_key)
  feeds.save = feeds.save.bind(feeds, feeds_doc_key)
}

module.exports = {
  monitor: monitor
}
