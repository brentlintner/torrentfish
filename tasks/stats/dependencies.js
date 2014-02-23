var npm_json = require('./../../package')

require('colors')

module.exports = function (md) {
  var modules = Object.keys(npm_json.dependencies)
                      .concat(Object.keys(npm_json.devDependencies))

  if (!md) {
    console.log("  brought to you by:")
    console.log()
  }

  modules
    .sort()
    .forEach(function (name) {
      if (!md) console.log("  " + name.cyan)
      else console.log(name)
    })
}
