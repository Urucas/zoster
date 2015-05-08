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
  
  mainWindow = new BrowserWindow({width: 1032, height: 600});

  var server = require('./server');
  server(false, function(data) {
    
    if(data.err) return quit(data.err);
    mainWindow.loadUrl(data.url);
    mainWindow.on('closed', function() {
      mainWindow = null;
    });
    // mainWindow.openDevTools({detach:true});

  });
  
});
