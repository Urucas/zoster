'use strict'
module.exports = function(open, cb) {
  var zoster = require('./node/');
  var port = process.env.PORT || "5000"; 
  var url  = ['http://','0.0.0.0:',port].join("");
  
  zoster(port).listen(port, '0.0.0.0', function(err){
    if(err) return (cb !=undefined ? cb({err:err}) : console.log(err));
    if(cb !=undefined) cb({url:url, err:false});
  });

  if(open != undefined && open) {
    var open = require('child_process').spawn;
    open("open", [url]);
  }
}
