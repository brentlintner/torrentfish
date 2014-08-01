describe('parser', function () {
  var
    FeedParser = require('feedparser'),
    zlib = require('zlib'),
    request = require('request'),
    logger = require('./../../lib/logger'),
    parser = require('./../../lib/parser'),
    sinon_chai = require('./../fixtures/sinon_chai'), _

  sinon_chai(function (sandbox) { _ = sandbox })

  describe('scrape', function () {
    var
      url = 'http://foo.com/bar.rss',
      log, req, res, callback

    beforeEach(function () {
      callback = _.stub()
      log = {error: _.stub()}
      res = {headers: {}, on: _.stub(), pipe: _.stub()}
      req = {on: _.stub()}

      res.pipe.returns(res)
      res.on.returns(res)
      req.on
        .returns(req)
        .withArgs('response')
        .callsArgWith(1, res)

      _.stub(logger, 'create').returns(log)
      _.stub(request, 'call').returns(req)
      _.stub(FeedParser, 'call')
      _.stub(zlib, 'createUnzip')
    })

    it('requests the feed url', function () {
      parser.scrape(url, callback)
      request.call.should.have.been.calledWith(request, url)
    })

    describe('unzipping encoded response', function () {
      it('unzips any request that is gzip encoded', function () {
        res.headers['content-encoding'] = 'gzip'
        zlib.createUnzip.returns('unzip')
        parser.scrape(url, callback)
        res.pipe.should.have.been.calledWith('unzip')
      })

      it('unzips any request that is deflate encoded', function () {
        res.headers['content-encoding'] = 'deflate'
        zlib.createUnzip.returns('unzip')
        parser.scrape(url, callback)
        res.pipe.should.have.been.calledWith('unzip')
      })

      it('does not unzip if no encoding headers are present', function () {
        delete res.headers['content-encoding']
        zlib.createUnzip.returns('unzip')
        parser.scrape(url, callback)
        res.pipe.should.not.have.been.calledWith('unzip')
      })
    })

    it('inits a feedparser stream', function () {
      FeedParser.call.returns('feedparser')

      parser.scrape(url, callback)

      FeedParser.call.should.have.been.calledWith(FeedParser, [{
        feedurl: url,
        normalize: true
      }])
      res.pipe.should.have.been.calledWith('feedparser')
    })

    it('reads in a complete stream and calls back for each item', function () {
      var
        read = 0,
        item = _.stub(),
        stream = {read: function () { // simulate 2 items
          return(read++, read <= 2 ? item : undefined)
        }}

      parser.scrape(url, callback)

      _.stub(process, 'nextTick').callsArg(0)

      // TODO: use advanced sinon stuff vs invoking callback
      res.on.should.have.been.calledWith('readable')
      res.on.args[1][1].call(stream)
      process.nextTick.restore()

      callback.should.have.been.calledTwice
      callback.should.always.have.been.calledWith(null, item)
    })

    it('logs the error, and calls back with it', function () {
      var err = {foo: 'bar'}

      res.on.withArgs('error')
            .callsArgWith(1, err)
            .returns(res)

      parser.scrape(url, callback)

      log.error.should.have.been.calledWith(err)
    })
  })
})
