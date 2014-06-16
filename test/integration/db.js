var
  shell = require('shelljs'),
  path = require('path'),
  mimus = require('mimus')

require('./../fixtures/sinon_chai')
require('./../fixtures/expect')

describe('db integration', function () {
  var
    db = mimus.require('./../../lib/db', __dirname, [
      './logger'
    ]),
    logger = mimus.get(db, 'logger'),
    db_int_db = path.join(__dirname, '..', '..', 'db_integration_test.db')

  before(function () {
    mimus.stub(logger, 'create')
  })

  beforeEach(function () {
    logger.create.returns({
      info: mimus.stub(),
      error: mimus.stub()
    })
  })

  afterEach(function () {
    mimus.reset()

    if (shell.test('-e', db_int_db)) {
      shell.rm(db_int_db)
    }
  })

  it('writes, reads and removes from the db', function (done) {
    var test_obj = {bar: 2}

    db.open(db_int_db, function (test_db) {
      test_db.set('foo', test_obj, function () {
        expect(test_db.get('foo')).to.equal(test_obj)

        test_db.rm('foo', function () {
          expect(test_db.get('foo')).to.eql(undefined)
          done()
        })
      })
    })
  })
})
