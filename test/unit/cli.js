describe('cli', function () {
  var
    optimist = require('optimist'),
    logger = require('./../../lib/logger'),
    cli = require('./../../lib/cli'),
    cli_help = require('./../../lib/cli/help'), // will always be here
    cli_daemon = require('./../../lib/cli/daemon'),
    sinon_chai = require('./../fixtures/sinon_chai'), _

  sinon_chai(function (sinon) { _ = sinon })

  describe('interpret', function () {
    var
      argv,
      original_argv,
      log

    beforeEach(function () {
      original_argv = optimist.argv
      argv = {}
      optimist.argv = argv

      _.stub(logger, 'create')
        .returns(log = {
          info: _.stub(),
          error: _.stub()
        })

      _.stub(cli_help, 'default')
      _.stub(cli_help, 'help')
      _.stub(cli_daemon, 'default')
      _.stub(cli_daemon, 'monitor')
    })

    afterEach(function () {
      optimist.argv = original_argv
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
