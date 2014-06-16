var mimus = require('mimus')

require('./../../fixtures/sinon_chai')
require('./../../fixtures/expect')

describe('daemon.poll', function () {
  var
    poll = mimus.require('./../../../lib/daemon/poll', __dirname, [
      './digest',
      './../logger',
      './../parser'
    ]),
    parser = mimus.get(poll, 'parser'),
    logger = mimus.get(poll, 'logger'),
    digest = mimus.get(poll, 'digest'),
    log = { info: mimus.stub(), error: mimus.stub() },
    feeds_db = {
      forEach: mimus.stub(),
      get: mimus.stub(),
      set: mimus.stub()
    },
    url,
    setInterval

  before(function () {
    setInterval = mimus.stub()
    mimus.set(poll, 'interval', setInterval)
  })

  beforeEach(function () {
    url = 'http://'
    logger.create.withArgs('poll').returns(log)
  })

  afterEach(mimus.reset)

  describe('polling a feed', function () {
    it('sets a feed check interval', function () {
      poll.feed(url, feeds_db, {interval: 1})
      expect(setInterval.args[0][1]).to.eql(1 * 60 * 60 * 1000)
    })

    it('scrapes feed on set check interval', function () {
      setInterval.onCall(0).callsArg(0)
      poll.feed(url, feeds_db, {interval: 1})
      parser.scrape.should.have.been.calledOnce
      parser.scrape.should.have.been.calledWith(url)
    })

    it('sets an email digest interval', function () {
      poll.feed(url, feeds_db, {email_interval: 1})
      expect(setInterval.args[1][1]).to.eql(1 * 60 * 60 * 1000)
    })

    it('sends a digest on set email interval', function () {
      setInterval.onCall(1).callsArg(0)
      poll.feed(url, feeds_db, {email_interval: 1})
      digest.send.should.have.been.calledWith(feeds_db)
    })

    it('(also) checks feed on next tick (for immediate feedback)', function (done) {
      poll.feed(url, feeds_db)
      process.nextTick(function () {
        parser.scrape.should.have.been.calledWith(url)
        done()
      })
    })

    it('does nothing when there is an error (and no exception happen)', function (done) {
      var err = new Error('foo')
      parser.scrape.withArgs(url).callsArgWith(1, err, null)
      poll.feed(url, feeds_db)
      process.nextTick(function () {
        done()
      })
    })

    describe('for each scraped item', function () {
      var item

      beforeEach(function () {
        item = { title: 'some title', link: 'http://' }
        parser.scrape.withArgs(url).callsArgWith(1, null, item)
      })

      describe('that matches a watchlist item', function () {
        it('is added to the db if it matches any watchlist items', function (done) {
          var watchlist = {"something": [/some\stitle/i, /title/i]}

          poll.feed(url, feeds_db, { watchlist: watchlist })

          process.nextTick(function () {
            feeds_db.set.should.have.been
              .calledWith(item.title, {
                link: item.link,
                notified: false
              })
            done()
          })
        })

        it('is ignored if it already exists', function (done) {
          var watchlist = {"something": [/some\stitle/i]}

          feeds_db.get.withArgs(item.title).returns({})

          poll.feed(url, feeds_db, { watchlist: watchlist })

          process.nextTick(function () {
            feeds_db.set.should.not.have.been
              .calledWith(item.title, {
                link: item.link,
                notified: false
              })
            done()
          })
        })
      })
    })
  })
})
