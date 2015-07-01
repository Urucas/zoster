'use strict'
module.exports = function(options) {
  if(options.caps) {
    var caps = options.caps;
    if(caps.inception) {
      try {
        caps.inception.test = require(caps.inception.path);
        caps.inception.test = caps.inception.test[caps.inception.name];
        if(caps.inception.test == undefined) {
          throw new Error("Check your test name is correct!");
        }
        options.caps = caps;
      }catch(e) {
        console.log("Error loading inception test!");
        console.log(e.toString());
        process.exit(0);
      }
    }
    var server = require('./server');
    server(false, null, options.caps);
    return;
  }
  if(options.neutron) {
    // run zoster electron less
    var server = require('./server');
    server(true);
    return;
  }

  // run zoster as electron app
  var spawn = require("child_process").spawn;
  var platforms = {
    darwin: {
      prebuilt: "/node_modules/electron-prebuilt/dist/Electron.app/Contents/MacOS/Electron",
    },
    linux: {
      prebuilt: "/node_modules/electron-prebuilt/dist/electron",
    },
    win: {
      prebuilt: "\node_modules\electron\electron.exe",
    }
  }
  var platform = null;
  if(process.platform == "darwin") { platform = platforms["darwin"]; }
  else if(process.platform == "linux") { platform = platforms["linux"]; }
  else if(/^win/.test(process.platform)) { platform = platforms["win"]; }
  if(!platform) return console.log("Platform not supported");
  spawn(__dirname+platform.prebuilt, [__dirname, "--verbose"], {stdio:'inherit'});
}
