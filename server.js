'use strict'
var path = require('path')
module.exports = function (open, cb, caps) {
  var zoster = require(path.join(__dirname, 'node')).default
  var port = process.env.PORT || '5000'
  zoster({port: port, capabilities: caps, cb: cb, open: open}).run()
}
