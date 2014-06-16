var
  path = require('path'),
  fs = require('fs'),
  mimus = require('mimus')

require('./../../fixtures/sinon_chai')
require('./../../fixtures/expect')

describe('cli cmd:help', function () {
  var
    help = mimus.require('../../../lib/cli/help', __dirname, [
      './../logger'
    ]),
    logger = mimus.get(help, 'logger'),
    log = { error: mimus.stub() },
    cli_doc_folder = path.join(__dirname, '..', '..', '..', 'doc', 'lib', 'cli')

  before(function () {
    mimus.stub(logger, 'create')
    mimus.stub(fs, 'readFile')
  })

  afterEach(mimus.reset)

  describe('default cmd', function () {
    beforeEach(function () {
      logger.create.returns(log)
    })

    it('creates a cli logger instance', function () {
      help.default()
      logger.create.should.have.been.calledWith('cli')
    })

    describe('logging a help file', function () {
      var
        encoding = 'utf-8',
        default_help_file = path.join(cli_doc_folder, 'help.md')

      it('reads the default help file by default', function () {
        help.default()
        fs.readFile.should.have.been.calledWith(default_help_file, encoding)
      })

      it('can be told to read a specific help file', function () {
        var cmd_foo_help_file = path.join(cli_doc_folder, 'foo.md')
        help.default('foo')
        fs.readFile.should.have.been.calledWith(cmd_foo_help_file, encoding)
      })

      // TODO: able to mock/watch console.log methods without messing with mocha?
      describe('reading the file', function () {
        it('logs any errors', function () {
          var err = 'object'
          mimus.stub(console, 'log')
          help.default()
          fs.readFile.args[0][2](err)

          log.error.should.have.been.calledWith(err)
          console.log.should.not.have.been.called
          console.log.restore()
        })

        it('logs the data (if no errors)', function () {
          var data = 'string'
          mimus.stub(console, 'log')
          help.default()
          fs.readFile.args[0][2](null, data)

          console.log.should.have.been.calledWith(data)
          log.error.should.not.have.been.called

          console.log.restore()
        })
      })
    })
  })
})
