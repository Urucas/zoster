#!/usr/bin/env node
var fs = require('fs')
var links = ['angular', 'bootstrap', 'jquery', 'socket.io', 'zeroclipboard']
var path = require('path')
for (let i in links) {
  let dist = path.join(__dirname, 'node', links[i])
  let libPath = path.join(__dirname, 'node_modules', links[i])
  fs.symlinkSync(dist, libPath)
}
