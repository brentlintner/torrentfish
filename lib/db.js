var
  nstore = require('nstore'),
  logger = require('./logger'),
  log =  logger.create('db')

function open(name, callback) {
  var file = nstore.new(name, callback)

  function get(key, done) {
    file.get(key, function (err, doc) {
      if (err) log.error(err)
      done(err, doc)
    })
  }

  function save(key, doc, done) {
    file.save(key, doc, function (err) {
      if (err) log.error(err)
      done(err)
    })
  }

  return {
    get: get,
    save: save
  }
}

module.exports = {
  open: open
}
