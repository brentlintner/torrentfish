describe('daemon digest', function () {
  var
    mailer = require('./../../../lib/mailer'),
    logger = require('./../../../lib/logger'),
    conf = require('./../../../lib/config'),
    digest = require('./../../../lib/daemon/digest'),
    sinon_chai = require('./../../fixtures/sinon_chai'), _

  sinon_chai(function (sandbox) { _ = sandbox })

  describe('sending an email of unnotified items', function () {
    var
      log, feeds_db,
      notified_key, unnotified_key2, unnotified_key,
      notified_item, unnotified_item2, unnotified_item

    beforeEach(function () {
      notified_key = 'hh54g222h',
      unnotified_key = 'G43228j3g4',
      unnotified_key2 = 'X44hH3222',
      notified_item = {notified: true, link: 'http://somelink', title: notified_key},
      unnotified_item = {notified: false, link: 'http://anotherlink', title: unnotified_key},
      unnotified_item2 = {notified: false, link: 'http://lastlink', title: unnotified_key2}

      log = {error: _.stub(), info: _.stub()}

      // mimic user conf
      conf.user = {
        mailer: {auth: {}, digest: {}}
      }

      feeds_db = {
        set: _.stub(),
        get: _.stub(),
        forEach: function (cb) {
          cb(notified_key, notified_item)
          cb(unnotified_key, unnotified_item)
          cb(unnotified_key2, unnotified_item2)
        }
      }

      _.stub(mailer, 'send')
      _.stub(logger, 'create')
        .withArgs('digest')
        .returns(log)
    })

    afterEach(function () {
      delete conf.user
    })

    it('collects any unnotified items from the db', function () {
      digest.send(feeds_db)

      mailer.send.should.have.been.called

      var html_digest = mailer.send.args[0][0].html

      expect(html_digest).to.not.match(new RegExp(notified_item.title))
      expect(html_digest).to.not.match(new RegExp(notified_item.link))
      expect(html_digest).to.match(new RegExp(unnotified_item.title))
      expect(html_digest).to.match(new RegExp(unnotified_item.link))
      expect(html_digest).to.match(new RegExp(unnotified_item2.title))
      expect(html_digest).to.match(new RegExp(unnotified_item2.link))
    })

    it('passes in mailer auth (via config)', function () {
      conf.user.mailer.auth = {
        user: 'foo',
        pass: 'bar',
      }

      digest.send(feeds_db)

      expect(mailer.send.args[0][0].auth).to.eql(conf.user.mailer.auth)
    })
    
    it('passes in from, to, and subject (via config)', function () {
      conf.user.mailer.auth = {user: 'foo'}
      conf.user.mailer.digest.subject = 'digest email'

      digest.send(feeds_db)

      var opts = mailer.send.args[0][0]

      expect(opts.from).to.eql(conf.user.mailer.auth.user)
      expect(opts.to).to.eql(conf.user.mailer.auth.user)
      expect(opts.subject).to.eql(conf.user.mailer.digest.subject)
    })

    it('sorts the digest by title (alphabetically)', function () {
      digest.send(feeds_db)

      expect(mailer.send.args[0][0].html).to.match(new RegExp(
        unnotified_key + ".*" + unnotified_key2
      ))

      feeds_db.forEach = function (cb) {
        cb(notified_key, notified_item)
        cb(unnotified_key2, unnotified_item2)
        cb(unnotified_key, unnotified_item)
        cb(unnotified_key2, unnotified_item2) // simulate exact match
      }

      digest.send(feeds_db)

      expect(mailer.send.args[0][0].html).to.match(new RegExp(
        unnotified_key + ".*" + unnotified_key2
      ))
    })

    it('refuses to send email with 0 items', function () {
      feeds_db.forEach = function () {}
      digest.send(feeds_db)
      mailer.send.should.not.have.been.called
    })

    describe('when mailer is finished', function () {
      var err, res

      beforeEach(function () {
        err = {foo: 'bar'},
        res = {message: 'msg'}
      })

      it('saves each sent item as notified', function () {
        mailer.send.callsArgWith(1, null, res)

        digest.send(feeds_db)

        feeds_db.set.should.have.been.calledTwice
        feeds_db.set.should.have.been
          .calledWith(unnotified_key, {notified: true})
        feeds_db.set.should.have.been
          .calledWith(unnotified_key2, {notified: true})
      })
      
      describe('if there is an error', function () {
        it('logs error', function () {
          mailer.send.callsArgWith(1, err, res)
          digest.send(feeds_db)
          log.error.should.have.been.calledWith(err)
        })

        it('does not update the database (items) as notified', function () {
          mailer.send.callsArgWith(1, err, res)
          digest.send(feeds_db)
          feeds_db.set.should.not.have.been.called
        })
      })
    })
  })
})
