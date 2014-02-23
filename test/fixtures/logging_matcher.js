function matcher(regexp) {
  return new RegExp(regexp, 'ig')
}

module.exports = {
  check_interval: function (hours) {
    return matcher('check interval.*' + hours + 'h')
  },

  email_interval: function (hours) {
    return matcher('email interval.*' + hours + 'h')
  },

  db_load: function (db_path) {
    return matcher('db.*loaded.*' + db_path)
  },

  db_drain: function (db_path) {
    return matcher('db.*flushing records to disk.*' + db_path)
  },

  added_item: function (item_name) {
    return matcher('added.*' + item_name)
  },

  checking_feeds: function () {
    return matcher('poll.*checking feeds')
  },

  error: function (msg) {
    return matcher('err!.*' + (msg || ''))
  }
}
