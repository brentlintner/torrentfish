var
  express = require('express'),
  shell = require('shelljs'),
  path = require('path'),
  fs = require('fs'),
  expect = require('./../fixtures/expect'),
  config = require('./../../lib/config'),
  cli = require('./../fixtures/cli'),
  logged = require('./../fixtures/logging_matcher')

// TODO: torrentfish file stuff (cwd pickup)
// TODO: test with LOGFILE= support
// TODO: test help logging
// TODO: test successful email sending (somehow)?
// TODO: daemon CLI short opts?

describe('app [cli]', function () {
  var
    test_data_td_xml = path.join(__dirname, '..','data', 'td.xml'),
    system_app_test_dir = 'system_test_tmp',
    system_app_test_db = path.join(system_app_test_dir, 'system_app_test.db'),
    system_app_test_torrentfish_file = path.join(system_app_test_dir, 'system_app_torrentfish.js'),
    system_xml_feed_server_port = 6066,
    test_td_xml_url = 'http://localhost:' + system_xml_feed_server_port + '/td.xml',
    real_url = 'http://www.torrentday.com/torrents/rss?l28;l12;l25;l11;l3;l21;l13;l1;l24;l14;l26;l7;l2;' +
               'u=138040;tp=bd8d5be5da87a0c920adcfde91ce721c',
    xml_feed_server,
    torrent_fish_js

  function assert_no_errors(exit_code, stdout) {
    expect(exit_code).not.to.eql(1)
    expect(stdout).not.to.match(logged.error())
  }

  before(function (done) {
    torrent_fish_js = '{' +
      '"mailer": {' +
      '  "auth": {"user": "foo@gmail.com", "pass": "test"},' +
      '  "digest": {"subject": "watchlist digest"}' +
      '},' +
      '"watchlist": {"anything": [/.*/i]}' +
    '}'

    if (!shell.test('-e', system_app_test_dir)) {
      shell.mkdir(system_app_test_dir)
    }

    fs.writeFileSync(system_app_test_torrentfish_file,
                     torrent_fish_js, 'utf-8')

    xml_feed_server = express()
      .get('/td.xml', function (req, res) {
        res.set('content-type', 'application/xml')
        res.send(fs.readFileSync(test_data_td_xml))
      })
      .listen(system_xml_feed_server_port, done)
  })

  after(function (done) {
    shell.rm('-r', system_app_test_dir)
    xml_feed_server.close(done)
  })

  describe('using the daemon', function () {
    var opts

    beforeEach(function () {
      opts = {
        "--db": system_app_test_db,
        "--watchlist": system_app_test_torrentfish_file,
        "--url": test_td_xml_url
      }
    })

    afterEach(function () {
      if (shell.test('-e', system_app_test_db)) {
        shell.rm(system_app_test_db)
      }
    })

    it('exits unsuccessfully when no url is provided', function (done) {
      delete opts['--url']

      cli.spawn(opts, function (code, stdout) {
        expect(code).to.eql(1)
        expect(stdout).to.match(logged.error("no feed url provided"))
        done()
      })
    })

    it('loads the db (as expected)', function (done) {
      cli.spawn(opts, function (code, stdout) {
        assert_no_errors(code, stdout)
        expect(stdout).to.match(logged.db_load(system_app_test_db))
        done()
      })
    })

    it('successfully polls a local (feed example) url', function (done) {
      cli.spawn(opts, function (code, stdout) {
        assert_no_errors(code, stdout)
        expect(stdout).to.match(logged.added_item('just the tip'))
        expect(stdout).to.match(logged.added_item('super dave'))
        done()
      })
    })

    it('successfully polls with a real url', function (done) {
      opts['--url'] = real_url

      cli.spawn(opts, function (code, stdout) {
        assert_no_errors(code, stdout)
        expect(stdout).to.match(logged.added_item(''))
        expect(stdout).to.match(logged.checking_feeds())
        done()
      })
    })

    it('flushes db to disk after (before exit) after finding items', function (done) {
      cli.spawn(opts, function (code, stdout) {
        assert_no_errors(code, stdout)
        expect(stdout).to.match(logged.db_drain(system_app_test_db))
        done()
      })
    })

    it('uses sane interval defaults', function (done) {
      cli.spawn(opts, function (code, stdout) {
        assert_no_errors(code, stdout)
        expect(stdout).to.match(logged.check_interval(config.default_interval))
        expect(stdout).to.match(logged.email_interval(config.default_email_interval))
        expect(config.default_interval < config.default_email_interval).to.eql(true)
        done()
      })
    })

    it('accepts custom intervals', function (done) {
      opts['--interval'] = 3
      opts['--email_interval'] = 7

      cli.spawn(opts, function (code, stdout) {
        assert_no_errors(code, stdout)
        expect(stdout).to.match(logged.check_interval(3))
        expect(stdout).to.match(logged.email_interval(7))
        done()
      })
    })

    it('can handle really small check intervals', function (done) {
      opts['--interval'] = 0.0001

      cli.spawn(opts, function (code, stdout) {
        assert_no_errors(code, stdout)
        expect(stdout).to.match(logged.added_item('just the tip'))
        expect(stdout).to.match(logged.added_item('super dave'))
        done()
      })
    })

    it('stays up and running if digest send fails', function (done) {
      opts['--interval'] = 0.0001
      opts['--email_interval'] = 0.0003

      cli.spawn(opts, function (code, stdout) {
        expect(stdout).to.match(logged.error('Error: connect'))
        expect(code).not.to.eql(1)
        done()
      })
    })
  })
})
