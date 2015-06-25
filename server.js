'use strict'
module.exports = function(open, cb, caps) {
  var zoster = require('./node/');
  var port = process.env.PORT || "5000"; 
  var url  = ['http://','0.0.0.0:',port].join("");
  
  zoster({port:port, caps:caps, cb:cb});
  
  if(open != undefined && open) {
    require('openurl').open(url);
  }
}
