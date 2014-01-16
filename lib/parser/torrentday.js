function process_items(stream, callback) {
  var item
  while (item = stream.read()) {
    process.nextTick(callback.bind(callback, item))
  }
}

module.exports = {
  process: process_items
}
