describe('daemon.poll', function () {
  var
    parser = require('./../../../lib/parser'),
    logger = require('./../../../lib/logger'),
    poll = require('./../../../lib/daemon/poll'),
    digest = require('./../../../lib/daemon/digest'),
    sinon_chai = require('./../../fixtures/sinon_chai'), _

  sinon_chai(function (sandbox) { _ = sandbox })

  describe('polling a feed', function () {
    var url, feeds_db, log

    beforeEach(function () {
      log = {info: _.stub()}
      url = 'http://'
      feeds_db = {forEach: _.stub(), get: _.stub(), set: _.stub()}

      _.stub(parser, 'scrape')
      _.stub(digest, 'send')
      _.stub(logger, 'create').withArgs('poll').returns(log)
      _.stub(global, 'setInterval')
    })

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

    describe('for each scraped item', function () {
      var item

      beforeEach(function () {
        item = {title: 'some title', link: 'http://'}
        parser.scrape.withArgs(url).callsArgWith(1, item)
      })

      describe('that matches a watchlist item', function () {
        it('is added to the db if it matches any watchlist items', function (done) {
          var watchlist = {"something": [/some\stitle/i, /title/i]}

          poll.feed(url, feeds_db, {watchlist: watchlist})

          process.nextTick(function () {
            feeds_db.set.should.have.been
              .calledWith(item.title, {link: item.link, notified: false})
            done()
          })
        })

        it('is ignored if it already exists', function (done) {
          var watchlist = {"something": [/some\stitle/i]}

          feeds_db.get.withArgs(item.title).returns({})

          poll.feed(url, feeds_db, {watchlist: watchlist})

          process.nextTick(function () {
            feeds_db.set.should.not.have.been
              .calledWith(item.title, {link: item.link, notified: false})
            done()
          })
        })
      })
    })
  })
})
