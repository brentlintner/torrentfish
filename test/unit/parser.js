var mimus = require('mimus')

require('./../fixtures/sinon_chai')
require('./../fixtures/expect')

describe('parser', function () {
  var
    parser = mimus.require('../../lib/parser', __dirname, [
      './logger',
      'minilog',
      'FeedParser',
      'zlib',
      'request'
    ]),
    logger,
    zlib,
    FeedParser,
    request,
    url = 'http://foo.com/bar.rss',
    log, req, res, callback

  beforeEach(function () {
    callback = mimus.stub()

    log = {error: mimus.stub()}
    res = {headers: {}, on: mimus.stub(), pipe: mimus.stub()}
    req = {on: mimus.stub()}

    res.pipe.returns(res)
    res.on.returns(res)
    req.on
    .returns(req)
    .withArgs('response')
    .callsArgWith(1, res)

    FeedParser = { call: mimus.stub() }
    request = mimus.stub().returns(req)
    logger = mimus.get(parser, 'logger')
    zlib = mimus.get(parser, 'zlib')
    logger.create.returns(log)

    mimus.set(parser, 'FeedParser', FeedParser)
    mimus.set(parser, 'request', request)
  })

  afterEach(function () {
    mimus.reset()
  })

  describe('scrape', function () {
    it('requests the feed url', function () {
      parser.scrape(url, callback)
      request.should.have.been.calledWith(url)
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
        item = mimus.stub(),
        stream = {read: function () { // simulate 2 items
          return(read++, read <= 2 ? item : undefined)
        }}

      parser.scrape(url, callback)

      mimus.stub(process, 'nextTick').callsArg(0)

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
