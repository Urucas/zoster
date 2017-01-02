const app = require('app')
const BrowserWindow = require('browser-window')
var mainWindow = null

function quit (err) {
  if (err) {
    console.log(err)
  }
  mainWindow = null
  app.quit()
}

app.on('window-all-closed', _ => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', _ => {
  mainWindow = new BrowserWindow({width: 1040, height: 600})
  var server = require('./server')
  server(false, (data) => {
    if (data.err) {
      return quit(data.err)
    }
    mainWindow.loadUrl(data.url)
    mainWindow.on('closed', _ => {
      mainWindow = null
    })
    // mainWindow.openDevTools({detach:true})
  })
})
