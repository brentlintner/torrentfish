describe('logger', function () {
  var
    minilog = require('minilog'),
    fs = require('fs'),
    logger = require('./../../lib/logger'),
    expect = require('./../fixtures/expect'),
    sinon_chai = require('./../fixtures/sinon_chai'), _

  sinon_chai(function (sandbox) { _ = sandbox })

  beforeEach(function () {
    _.stub(minilog, 'pipe').returns(minilog)
    _.stub(fs, 'createWriteStream')
  })

  describe('setup', function () {
    it('pipes to colour formatted console by default', function () {
      logger.setup()
      minilog.pipe.should.have.been.calledWith(minilog.backends.nodeConsole.formatNpm)
      minilog.pipe.should.have.been.calledWith(minilog.backends.nodeConsole)
    })

    it('pipes to LOGFILE if specified', function () {
      fs.createWriteStream.returns('Stream')
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
      _.stub(minilog, 'call')
      logger.create(prefix)
      minilog.call.should.have.been.calledWith(minilog, prefix)
    })
  })
})
