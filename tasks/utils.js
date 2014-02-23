var
  fs = require('fs'),
  path = require('path')

function matches_js(p) {
  return p.match(/\.js$/)
}

function collect(p, files, matches) {
  if (!files) files = []

  matches = matches || matches_js

  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(function (item) {
      collect(path.join(p, item), files, matches)
    })
  } else if (matches(p)) {
    files.push(p)
  }

  return files
}

module.exports = {
  collect: collect
}
