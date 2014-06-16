var
  path = require('path'),
  mimus = require('mimus')

require('./../fixtures/sinon_chai')
require('./../fixtures/expect')

describe('daemon', function () {
  var
    daemon = mimus.require('./../../lib/daemon', __dirname, [
      './daemon/poll',
      './logger',
      './db'
    ]),
    poll = mimus.get(daemon, 'poll'),
    logger = mimus.get(daemon, 'logger'),
    db = mimus.get(daemon, 'db'),
    conf = mimus.get(daemon, '$'),
    fs = mimus.get(daemon, 'fs'),

    default_email_interval = parseInt(conf.default_interval * 3, 10),
    default_torrentfish_config = path.join(process.cwd(), conf.torrentfish_config_file),
    log = { error: mimus.stub() },
    db_instance = { set: mimus.stub(), get: mimus.stub() },

    minimal_opts

  before(function () {
    mimus.stub(fs, 'readFileSync')
    mimus.stub(fs, 'existsSync')
  })

  after(function () {
    fs.readFileSync.restore()
    fs.existsSync.restore()
  })

  afterEach(mimus.reset)

  describe('monitor', function () {
    beforeEach(function () {
      delete conf.user
      minimal_opts = { url: 'http://foo.com/bar.rss' }

      // fake default .torrentfish file in CWD
      fs.readFileSync.returns("{default: {}}")
      fs.existsSync
        .withArgs(default_torrentfish_config)
        .returns(true)

      db.open.callsArgWith(1, db_instance)
      logger.create.withArgs('daemon').returns(log)
    })

    it('handles undefined opts', function () {
      mimus.stub(process, 'exit')
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
          mimus.stub(process, 'exit')
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
        var
          fake_watchlist = { foo: 'bar' },
          user_conf = { watchlist: fake_watchlist }

        minimal_opts.watchlist = 'fakedir/.torrentfish.js'

        fs.existsSync.reset()
        fs.existsSync
          .withArgs(path.join(process.cwd(), minimal_opts.watchlist))
          .returns(true)

        fs.readFileSync.reset()
        fs.readFileSync
          .withArgs(path.join(process.cwd(), minimal_opts.watchlist))
          .returns(JSON.stringify(user_conf))

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
          mimus.stub(process, 'exit')
          mimus.stub(process, 'cwd').returns('/nowhere')
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
