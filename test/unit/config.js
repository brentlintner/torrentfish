describe('config', function () {
  var
    conf = require('./../../lib/config'),
    expect = require('./../fixtures/expect'),

    default_db_name = 'feeds.db',
    default_interval = 0.5, // hours
    torrentfish_config_file = '.torrentfish.js'

  describe('default DB name', function () {
    it('is ' + default_db_name, function () {
      expect(conf.default_db_name).to.equal(default_db_name)
    })
  })

  describe('default feed check interval', function () {
    it('is ' + default_interval, function () {
      expect(conf.default_interval).to.equal(default_interval)
    })
  })

  describe('default config file', function () {
    it('is ' + torrentfish_config_file, function () {
      expect(conf.torrentfish_config_file).to.equal(torrentfish_config_file)
    })
  })
})
