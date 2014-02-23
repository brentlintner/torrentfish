function use(module) {
  return function () {
    require('./tasks/' + module).apply(this, Array.prototype.slice.call(arguments))
  }
}

desc('jake test')
task('default', ['test'])

desc('checks for outdated npm packages via npm police')
task('police', use('police'), {async: true})

desc('runs jake lint:js')
task('lint', ['lint:js'])

namespace('lint', function () {
  desc('runs jshint')
  task('js', use('lint/js'), {async: true})
})

desc('runs unit tests')
task('test', ['test:all'])

namespace('test', function () {
  desc('runs "jake test" with code coverage')
  task('cov', use('test/coverage'))

  desc('runs all unit tests')
  task('unit', use('test/unit'), {async: true})

  desc('runs integration tests')
  task('integration', use('test/integration'), {async: true})

  desc('runs systems tests')
  task('system', use('test/system'), {async: true})

  desc('runs all testing (unit/integration/system)')
  task('all', ['test:unit[dot]', 'test:integration[dot]', 'test:system[dot]'])
})

desc('displays stats')
task('stats', ['stats:js', 'stats:sc'])

namespace('stats', function () {
  desc('displays some non-client code base stats')
  task('js', use('stats/js'))

  desc('this *should* display all third party modules used in the project')
  task('deps', use('stats/dependencies'))

  desc('shows any end of line semi-colons in code')
  task('sc', use('stats/semi_colons'), {async: true})
})
