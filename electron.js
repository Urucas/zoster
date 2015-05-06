var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow = null;

function quit(err) {
  if(err) console.log(err);
  mainWindow = null;
  app.quit();
}

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  var zoster = require('./node/');
  var port = process.env.PORT || "5000"; 
  var url  = [
    'http://',
    '0.0.0.0:',
    port
  ].join("");
  
  zoster(port).listen(port, '0.0.0.0', function(err){
      
    if(err) return quit(err);
    
    mainWindow.loadUrl(url);
    mainWindow.on('closed', function() {
      mainWindow = null;
    });

    mainWindow.openDevTools({detach:true});

  });
  
});
