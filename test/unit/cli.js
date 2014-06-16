var
  mimus = require('mimus'),
  optimist = require('optimist')

require('./../fixtures/sinon_chai')
require('./../fixtures/expect')

describe('cli', function () {
  var
    cli = mimus.require('../../lib/cli', __dirname, [
      './cli/help'
    ]),
    cli_help = mimus.get(cli, 'help'),
    cli_daemon = require('./../../lib/cli/daemon'),
    argv,
    original_argv

    before(function () {
      mimus.stub(cli_daemon, 'default')
      mimus.stub(cli_daemon, 'monitor')
    })

  describe('interpret', function () {
    beforeEach(function () {
      original_argv = optimist.argv
      argv = {}
      optimist.argv = argv
    })

    afterEach(function () {
      optimist.argv = original_argv
      mimus.reset()
    })

    describe('with no commands', function () {
      it('defaults to daemon.default', function () {
        argv._ = []
        cli.interpret()
        cli_daemon.default.should.have.been.calledWith(argv)
      })
    })

    describe('with one command', function () {
      it('passes opts to the "default" method on the respective cmd module', function () {
        argv._ = ['daemon']
        cli.interpret()
        cli_daemon.default.should.have.been.calledWith(argv)
      })
    })

    describe('with two commands', function () {
      it('passes opts to the "subcmd" method on the respective cmd module', function () {
        argv._ = ['daemon', 'monitor']
        cli.interpret()
        cli_daemon.monitor.should.have.been.calledWith(argv)
      })

      describe('when the first command is "help"', function () {
        it('passes the subcmd to the "default" method on the help module', function () {
          var subcmd = 'test'
          argv._ = ['help', subcmd]
          cli.interpret()

          cli_help.default.should.have.been.calledWith(subcmd)
        })
      })
    })
  })
})
