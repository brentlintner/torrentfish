describe('mailer', function () {
  var
    nodemailer = require('nodemailer'),
    mailer = require('./../../lib/mailer'),
    sinon_chai = require('./../fixtures/sinon_chai'), _

  sinon_chai(function (sandbox) { _ = sandbox })

  describe('send', function () {
    var
      callback,
      smtp_conn

    beforeEach(function () {
      callback = _.stub()
      smtp_conn = {close: _.stub(), sendMail: _.stub()}
      _.stub(nodemailer, 'createTransport').returns(smtp_conn)
    })

    it('creates an SMTP transporter', function () {
      mailer.send(undefined, callback)
      nodemailer.createTransport.should.have.been.calledWith("SMTP")
    })

    it('passes user auth info to SMTP transporter', function () {
      mailer.send({
        auth: {
          user: 'email',
          pass: 'foo'
        }
      }, callback)

      nodemailer.createTransport.should.have.been.calledWith("SMTP", {
        auth: {user: 'email', pass: 'foo'}
      })
    })

    it('passes opts to conn.sendMail', function () {
      var opts = {foo: 'bar'}
      mailer.send(opts, callback)
      smtp_conn.sendMail.should.have.been.calledWith(opts)
    })

    describe('on sent', function () {
      it('closes the connection', function () {
        mailer.send(undefined, callback)
        smtp_conn.sendMail.args[0][1]()
        smtp_conn.close.should.have.been.called
      })

      it('calls back with (possible) err and res data obj', function () {
        var err = 'error msg', res = 'res'
        mailer.send(undefined, callback)
        smtp_conn.sendMail.args[0][1](err, res)
        callback.should.have.been.calledWith(err, res)
      })
    })
  })
})
