var
  FeedParser = require('feedparser'),
  zlib = require('zlib'),
  request = require('request'),
  logger = require('./logger')

function stream_reader(callback) {
  return function () {
    var item, parsed = this
    while (item = parsed.read()) {
      process.nextTick(callback.bind(callback, null, item))
    }
  }
}

function scrape(feed_url, callback) {
  var
    log = logger.create('parser'),
    feed_parser_options = {
      feedurl: feed_url,
      normalize: true
    }

  request(feed_url)
    .on('response', function (res) {
      var
        ce = res.headers['content-encoding'],
        stream = (ce == 'gzip' || ce == 'deflate') ?
                  res.pipe(zlib.createUnzip()) : res

      stream
        .pipe(FeedParser.call(FeedParser, [feed_parser_options]))
        .on('error', function (err) {
          log.error(err)
          callback(err)
        })
        .on('readable', stream_reader(callback))
    })
}

module.exports = {
  scrape: scrape
}
