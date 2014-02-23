var
  mailer = require('./../mailer'),
  conf = require('./../config'),
  logger = require('./../logger')

function into_html_digest(html, item) {
  return html +
          '<br/>' +
          '<a href="' + item.link + '">' +
            item.title +
          '</a></br></br>'
}

function by_title(a, b) {
  var
    x = a.title.toLowerCase(),
    y = b.title.toLowerCase()
  return x < y ? -1 : (x > y ? 1 : 0)
}

function email_found(feeds_db) {
  var
    log = logger.create('digest'),
    digest = []

  log.info('checking for any titles yet to be emailed')

  feeds_db.forEach(function (key, item) {
    if (item.notified) return
    digest.push({title: key, link: item.link})
  })

  if (digest.length === 0) return

  mailer.send({
    auth: conf.user.mailer.auth,
    from: conf.user.mailer.auth.user,
    to: conf.user.mailer.auth.user,
    subject: conf.user.mailer.digest.subject,
    html: digest.sort(by_title)
                .reduce(into_html_digest,
                        '<p>Here are some things that are of interest.</p>')
  }, function (err, res) {
    if (err) return log.error(err), undefined

    log.info("email sent - response: " + res.message)

    digest.forEach(function (item) {
      feeds_db.set(item.title, {notified: true})
    })
  })
}

module.exports = {
  send: email_found
}
