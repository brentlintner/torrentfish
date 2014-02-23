var
  exec_opts = {
    printStdout: true,
    printStderr: true,
    breakOnError: false
  }

function semi_colons() {
  jake.exec(["grep -rnE ';$' lib test tasks --include *.js"], exec_opts, complete)
}

module.exports = semi_colons
