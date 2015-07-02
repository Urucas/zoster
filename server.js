'use strict'
module.exports = function(open, cb, caps) {
  var zoster = require(__dirname+'/node/');
  var port = process.env.PORT || "5000"; 
    
  zoster({port:port, capabilities:caps, cb:cb, open:open}).run();
  
}
