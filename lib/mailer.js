var
  mailer = require('nodemailer'),
  prompt = require('prompt'),
  logger = require('./logger'),
  config = require('./config'),
  log = logger.create('mailer')

function setup(callback) {
  prompt.start()
  prompt.get({
    properties: {
      email: {},
      password: {hidden: true}
    }
  }, function (err, opts) {
    if (err) (log.error(err), process.exit(1))

    config.email = opts.email
    config.password = opts.password

    callback()
  })
}

function smtp_mailer() {
  return mailer.createTransport("SMTP", {
    auth: {
      user: config.email,
      pass: config.password
    }
  })
}

function send(opts, callback) {
  if (!opts.from) opts.from = 'an extension of yourself <brent.lintner@gmail.com>'
  if (!opts.to) opts.to = 'brent.lintner@gmail.com'

  var conn = smtp_mailer()

  conn.sendMail(opts, function(err, res) {
    conn.close()
    callback(err, res)
  })
}


module.exports = {
  send: send,
  setup: setup
}
