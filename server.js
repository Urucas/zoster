var zoster = require('./node/');
var port = process.env.PORT || "5000"; 
var url  = ['http://','0.0.0.0:',port].join("");
  
zoster(port).listen(port, '0.0.0.0', function(err){
  if(err) return quit(err);
});

var open = require('child_process').spawn;		
open("open", [url]);
