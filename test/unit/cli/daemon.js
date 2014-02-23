describe('cli cmd:daemon', function () {
  var
    cli_daemon = require('./../../../lib/cli/daemon'),
    daemon = require('./../../../lib/daemon'),
    sinon_chai = require('./../../fixtures/sinon_chai'), _

  sinon_chai(function (sandbox) { _ = sandbox })

  beforeEach(function () {
    _.stub(daemon, 'monitor')
  })

  describe('cmd:default', function () {
    it('passes through to daemon.monitor', function () {
      var opts = {foo: 'bar'}
      cli_daemon.default(opts)
      daemon.monitor.should.have.been.calledWith(opts)
    })
  })

  describe('cmd:monitor', function () {
    it('calls daemon.monitor with opts', function () {
      var opts = {foo: 'bar'}
      cli_daemon.monitor(opts)
      daemon.monitor.should.have.been.calledWith(opts)
    })

    describe('short hand opts', function () {
      function test_for(short, long) {
        var
          val = 'arbitrary',
          opts = {},
          expected = {}

        expected[long] = val
        opts[short] = val

        cli_daemon.monitor(opts)

        daemon.monitor.should.have.been.calledWith(expected)
      }

      it('accepts -u (as url)', function () {
        test_for('u', 'url')
      })

      it('accepts -i (as interval)', function () {
        test_for('i', 'interval')
      })

      it('accepts -e (as email_interval)', function () {
        test_for('e', 'email_interval')
      })

      it('accepts -w (as watchlist)', function () {
        test_for('w', 'watchlist')
      })
    })
  })
})
