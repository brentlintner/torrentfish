var mimus = require('mimus')

require('./../fixtures/sinon_chai')
require('./../fixtures/expect')

describe('mailer', function () {
  var
    mailer = mimus.require('../../lib/mailer', __dirname, [
      'nodemailer'
    ]),
    nodemailer,
    callback,
    smtp_conn

  describe('send', function () {
    beforeEach(function () {
      callback = mimus.stub()
      smtp_conn = {close: mimus.stub(), sendMail: mimus.stub()}
      nodemailer = mimus.get(mailer, 'mailer')
      nodemailer.createTransport.returns(smtp_conn)
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
