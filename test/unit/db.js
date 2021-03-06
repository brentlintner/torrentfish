var mimus = require('mimus')

require('./../fixtures/sinon_chai')
require('./../fixtures/expect')

describe('db', function () {
  var
    db = mimus.require('./../../lib/db', __dirname, [
      './../../lib/logger',
      'minilog',
      'dirty'
    ]),
    dirty = mimus.get(db, 'dirty'),
    logger = mimus.get(db, 'logger'),
    db_loaded, db_instance, log_instance

  before(function () {
    db_loaded = mimus.stub()
    db_instance = {
      set: mimus.stub(),
      get: mimus.stub(),
      on: mimus.stub()
    }

    log_instance = { info: mimus.stub() }
    dirty.returns(db_instance)
    logger.create.returns(log_instance)
  })

  afterEach(mimus.reset)

  // since this is a passthrough to 'dirty' module, test abstraction layer only
  // anything else should be in integration/system
  describe('opening', function () {
    it('creates a dirty db with a given name', function () {
      db.open('foo', db_loaded)
      dirty.should.have.been.calledWith('foo')
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
