var
  mailer = require('nodemailer')

function send(opts, callback) {
  if (!opts) opts = {}

  var conn = mailer.createTransport("SMTP", {auth: opts.auth})

  conn.sendMail(opts, function (err, res) {
    conn.close()
    callback(err, res)
  })
}

module.exports = {
  send: send
}
