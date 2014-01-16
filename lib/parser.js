var
  FeedParser = require('feedparser'),
  zlib = require('zlib'),
  url = require('url'),
  request = require('request'),
  logger = require('./logger'),
  log = logger.create('parser')

function scrape(feed_url, callback) {
  var
    domain = url.parse(feed_url)
                .hostname
                .replace(/^([^\.]*\.)/, '')
                .replace(/(\.[^\.]*)$/, ''),
    handler = require('./parser/' + domain),
    feed_parser_options = {
      feedurl: feed_url,
      normalize: true
    }

  request(feed_url)
    .pipe(zlib.createGunzip()) // TODO: only do if headers match
    .pipe(new FeedParser([feed_parser_options]))
    .on('error', log.error)
    .on('readable', function () {
      handler.process(this, callback)
    })
}

module.exports = {
  scrape: scrape
}
