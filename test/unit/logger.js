var mimus = require('mimus')

require('./../fixtures/sinon_chai')
require('./../fixtures/expect')

describe('logger', function () {
  var
    logger = mimus.require('../../lib/logger', __dirname, [
      'minilog'
    ]),
    fs_createWriteStream = mimus.stub(),
    minilog

  beforeEach(function () {
    minilog = mimus.get(logger, 'minilog')
    mimus.set(logger, 'fs', {createWriteStream: fs_createWriteStream})
    // TODO recursive support
    minilog.pipe.returns(minilog)
  })

  afterEach(mimus.reset)

  describe('setup', function () {
    it('pipes to colour formatted console by default', function () {
      logger.setup()
      minilog.pipe.should.have.been.calledWith(minilog.backends.nodeConsole.formatNpm)
      minilog.pipe.should.have.been.calledWith(minilog.backends.nodeConsole)
    })

    it('pipes to LOGFILE if specified', function () {
      fs_createWriteStream.returns('Stream')
      process.env.LOGFILE = 'logfile.log'

      logger.setup()

      minilog.pipe.should.have.been.calledWith('Stream')
      minilog.pipe.should.have.been.calledOnce
      expect(delete process.env.LOGFILE).to.equal(true)
    })
  })

  describe('create', function () {
    it('returns a generated minilog api with a prefix', function () {
      var prefix = 'foo'
      mimus.stub(minilog, 'call')
      logger.create(prefix)
      minilog.call.should.have.been.calledWith(minilog, prefix)
    })
  })
})
