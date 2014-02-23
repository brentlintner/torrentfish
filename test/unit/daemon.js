describe('daemon', function () {
  var
    path = require('path'),
    fs = require('fs'),
    daemon = require('./../../lib/daemon'),
    poll = require('./../../lib/daemon/poll'),
    logger = require('./../../lib/logger'),
    db = require('./../../lib/db'),
    conf = require('./../../lib/config'),
    sinon_chai = require('./../fixtures/sinon_chai'), _

  sinon_chai(function (sandbox) { _ = sandbox })

  describe('monitor', function () {
    var
      db_instance, log, minimal_opts, user_conf,
      default_email_interval = parseInt(conf.default_interval * 3, 10),
      default_torrentfish_config = path.join(process.cwd(), conf.torrentfish_config_file)


    beforeEach(function () {
      db_instance = {set: _.stub(), get: _.stub()}
      log = {error: _.stub()}
      minimal_opts = {
        url: 'http://foo.com/bar.rss'
      }

      // fake default .torrentfish file in CWD
      _.stub(JSON, 'parse').returnsArg(0)
      _.stub(fs, 'existsSync')
        .withArgs(default_torrentfish_config)
        .returns(true)
      _.stub(fs, 'readFileSync')
        .returns("{}")

      _.stub(logger, 'create').withArgs('daemon').returns(log)
      _.stub(db, 'open').callsArgWith(1, db_instance)
      _.stub(poll, 'feed')
    })

    beforeEach(function () {
      delete conf.user
    })

    it('handles undefined opts', function () {
      _.stub(process, 'exit')
      daemon.monitor()
      process.exit.should.have.been.calledWith(1)
      process.exit.restore()
    })

    it('opens the database', function () {
      var default_db = path.join(process.cwd(), conf.default_db_name)
      daemon.monitor(minimal_opts)
      db.open.should.have.been.calledWith(default_db)
    })

    it('accepts a custom db name', function () {
      minimal_opts.db = 'foo.db'
      daemon.monitor(minimal_opts)
      db.open.should.have.been.calledWith(path.join(process.cwd(), 'foo.db'))
    })

    it('polls feed url', function () {
      daemon.monitor(minimal_opts)

      poll.feed.should.have.been
        .calledWith(minimal_opts.url, db_instance, {
          watchlist: conf.user.watchlist,
          interval: conf.default_interval,
          email_interval: default_email_interval
        })
    })

    describe('custom check interval', function () {
      it('via opts.interval', function () {
        minimal_opts.interval = 5

        daemon.monitor(minimal_opts)

        poll.feed.should.have.been
          .calledWith(minimal_opts.url, db_instance, {
            watchlist: conf.user.watchlist,
            interval: minimal_opts.interval,
            email_interval: default_email_interval
          })
      })
    })

    describe('custom email check interval', function () {
      it('via opts.email_interval', function () {
        minimal_opts.email_interval = 34

        daemon.monitor(minimal_opts)

        poll.feed.should.have.been
          .calledWith(minimal_opts.url, db_instance, {
            watchlist: conf.user.watchlist,
            interval: conf.default_interval,
            email_interval: minimal_opts.email_interval
          })
      })
    })

    describe('specifying a feed url', function () {
      it('via opts.url', function () {
        daemon.monitor(minimal_opts)
        expect(poll.feed.args[0][0]).to.equal(minimal_opts.url)
      })

      describe('if no url is provided', function () {
        it('logs error and exits process', function () {
          _.stub(process, 'exit')
          delete minimal_opts.url

          daemon.monitor(minimal_opts)

          log.error.should.have.been.calledWith('no feed url provided')
          process.exit.should.have.been.calledWith(1)
          process.exit.restore()
        })
      })
    })

    describe('specifying a user conf (with a watchlist)', function () {
      it('via opts.watchlist', function () {
        var fake_watchlist = {}

        minimal_opts.watchlist = 'fakedir/.torrentfish.js'

        fs.existsSync
          .withArgs(path.join(process.cwd(), minimal_opts.watchlist))
          .returns(true)

        fs.readFileSync
          .withArgs(path.join(process.cwd(), minimal_opts.watchlist))
          .returns(JSON.stringify(user_conf = {
            watchlist: fake_watchlist
          }))

        daemon.monitor(minimal_opts)

        poll.feed.should.have.been
          .calledWith(minimal_opts.url, db_instance, {
            watchlist: fake_watchlist,
            interval: conf.default_interval,
            email_interval: default_email_interval
          })
      })

      describe('if no watchlist is found', function () {
        it('logs error and exits process', function () {
          _.stub(process, 'exit')
          _.stub(process, 'cwd').returns('/nowhere')
          delete minimal_opts.watchlist

          daemon.monitor(minimal_opts)

          log.error.should.have.been.calledWith('could not find a user conf (with a watchlist)')
          process.exit.should.have.been.calledWith(1)
          process.exit.restore()
          process.cwd.restore()
        })
      })
    })
  })
})
