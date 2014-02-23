describe('db', function () {
  var
    dirty = require('dirty'),
    db = require('./../../lib/db'),
    logger = require('./../../lib/logger'),
    sinon_chai = require('./../fixtures/sinon_chai'), _,

    db_loaded,
    db_instance,
    log_instance

  sinon_chai(function (sandbox) { _ = sandbox })

  beforeEach(function () {
    db_loaded = _.stub()
    db_instance = {
      set: _.stub(),
      get: _.stub(),
      on: _.stub()
    }

    log_instance = {
      info: _.stub()
    }

    _.stub(logger, 'create').returns(log_instance)
    _.stub(dirty, 'call').returns(db_instance)
  })

  // since this is a passthrough to 'dirty' module, test abstraction layer only
  // anything else should be in integration/system
  describe('opening', function () {
    it('creates a dirty db with a given name', function () {
      db.open('foo', db_loaded)
      dirty.call.should.have.been.calledWith(dirty, 'foo')
    })

    it('auto binds and calls back on db:load event', function () {
      db.open('bar', db_loaded)
      db_instance.on.should.have.been.calledWith('load')
      db_instance.on.args[0][1]() // could be better (mock?)
      log_instance.info.should.have.been.called
      expect(log_instance.info.args[0][0]).to.match(/loaded/i)
      db_loaded.should.have.been.calledWith(db_instance)
    })

    it('auto binds (and logs) on:drain', function () {
      db.open('foo', db_loaded)
      db_instance.on.should.have.been.calledWith('drain')
      db_instance.on.args[1][1]() // could be better (mock?)
      log_instance.info.should.have.been.called
      expect(log_instance.info.args[0][0]).to.match(/flushing records to disk/i)
    })

    it('creates a db logger instance', function () {
      db.open('foo', db_loaded)
      logger.create.should.have.been.calledWith('db')
    })
  })
})
