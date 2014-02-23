describe('db integration', function () {
  var
    shell = require('shelljs'),
    path = require('path'),
    db = require('./../../lib/db'),
    logger = require('./../../lib/logger'),
    sinon_chai = require('./../fixtures/sinon_chai'), _,
    db_int_db = path.join(__dirname, '..', '..', 'db_integration_test.db')

  sinon_chai(function (sandbox) { _ = sandbox })

  beforeEach(function () {
    _.stub(logger, 'create')
      .returns({info: _.stub(), error: _.stub()})
  })

  afterEach(function () {
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
