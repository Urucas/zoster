'use strict'
module.exports = function(open, cb, caps) {
  var zoster = require('./node/');
  var port = process.env.PORT || "5000"; 
    
  zoster({port:port, caps:caps, cb:cb, open:open});
  
}
