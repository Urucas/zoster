// es6 runtime requirements
require('babel/polyfill');
import express from 'express';
import { Server as http } from 'http';
import sockets from 'socket.io';
import ADB from 'adbjs';
import ar from 'appium-running';
import android_test from './android_test';
import iip from 'internal-ip';
import dom from 'vd';
import multer from 'multer';
import colors from 'colors';

export default function zoster({
  port = process.env.PORT,
  capabilities = null,
  cb  = null,
  open = undefined
  } = {}){

  let instance = {};
      instance.adb = new ADB();
      instance.port = port;
      instance.capabilities = capabilities;

  instance.get_devices = () => {
    let devices = [];
    let adb = instance.adb;
    try { devices = adb.devices();
    }catch(e){
      throw new Error("NO available devices, please connect your android!");
    }
    if(!devices.length) {
      throw new Error("NO available devices, please connect your android!");
    }
    return devices;
  }

  instance.exit_error = (err) => {
    console.log(err.toString());
    process.exit(0);
  }

  instance.install_apk = (caps) => {
    try {
      let adb = instance.adb;
      if(!adb.install(caps.apk_path, caps.pkg)) {
        throw new Error("Error installing app("+caps.pkg+")");
      }
    }catch(e){
      throw new Error("Error installing app("+caps.pkg+")");
    }
  }

  instance.is_package_installed = (caps) => {
    let adb = instance.adb;
    if(!adb.isPackageInstalled(caps.pkg)){
      return false;
    }
    return true;
  }

  instance.stringify_params = (params) => {
    let strParams = [];
    for(let k in params) {
      if(params[k].name == "" || params[k].name == undefined) continue;
      strParams.push(params[k].name+"="+params[k].value);
    }
    return strParams.join('&');
  }
  
  instance.create_intent_url = (caps) => {
    let params = instance.stringify_params(caps.params);
    return [
      "intent://", caps.scheme, '/',
      caps.action, '?', params,
      '#Intent;scheme=', caps.scheme, ';package=',
      caps.pkg, ';end'
    ].join('');
  }

  instance.is_intenturl_ok = (url) => {
    return /^intent:\/\/\w[\w\d]*\/\w[\w\d]*\?[\w\d\=\&]*\#Intent\;scheme\=\w[\w\d]*\;package\=\w[\w\d\.\-]*\;end/.test(url);
  }
  
  instance.check_min_capabilities = (caps) => {
    if(caps.pkg == undefined || caps.pkg == "") return false;
    if(caps.intentURL){
      return instance.is_intenturl_ok(caps.intentURL);
    }

    if(caps.scheme == undefined || caps.scheme == "") return false;
    if(caps.action == undefined || caps.action == "") return false;
    return true;
  }

  instance.test = (caps) => {
    
    let log   = caps.log || console.log;
    let error = caps.err || instance.exit_error;
    
    log("Running Zoster test"+(caps.name ? " > "+caps.name : ""));

    if(!instance.check_min_capabilities(caps)) {
      error("Check minimal capabilities are defined!");
      return;
    }
    
    caps.port = 4723;
    caps.log = log;
    caps.intentURL = caps.intentURL || instance.create_intent_url(caps);
    
    log("Getting available devices");
    let devices = [];
    try {
      devices = instance.get_devices();
    }catch(e) {
      error(e);
      return;
    }
    log("Using device ("+devices[0]+")");
    if(caps.apk_path) {
      if(caps.apk_upload) {
        caps.apk_path = [__dirname, "/tmp-apk/", caps.pkg, ".apk"].join("");
      }
      log("Installing package ("+caps.pkg+")");
      try { instance.install_apk(caps); }catch(e) {
        error(e);
        return;
      }
    }else{
      log("Checking package ("+caps.pkg+") is installed");
      if(!instance.is_package_installed(caps)) {
        error("Package ("+caps.pkg+") not installed. Please install your app first!");
        return;
      }
      log("Package ("+caps.pkg+") installed! Move Along!");
    }

    let adb = instance.adb;
    if(adb.isAppRunning(caps.pkg)) {
      log("Closing app");
      adb.closeApp(caps.pkg);
    }
    
    log("Checking Appium is running");
    ar(4723, (success) => {
      if(!success) {
        error("Appium is not running, please run: appium &");
        return;
      }

      log("Appium is running! Keep going!");
      
      let test_site = caps.test_site == "" ? "local" : caps.test_site;
      if(test_site == "local") {
        let ip = iip();
        caps.url = "http://"+ip+":"+port+"/test";
        caps.local = true;
      }else {
        caps.url = test_site;
        caps.local = false;
      }
      caps.adb = adb;
      caps.cb = (success) => {
        if(success){
          caps.success();
          return;
        }
        caps.failed();
      };

      try { android_test(caps); }
      catch(e) {
        console.log(e);
        error(e.toString);
      }
      
    });
    
  };
  
  instance.create_local_server_app = () => {
    
    let app = express();
    let server = http(app);
    server.__express__ = app;
     
    // static files
    app.use(express.static(__dirname + '/../public'));
    app.get("/", (req, res) => {
      res.sendFile(__dirname + '/../public/index.html');
    });

    app.post("/upload", (req, res) => {
      let files = req.files;
      res.json(req.files);
    });

    app.use(multer({
      dest:__dirname+'/tmp-apk',
      rename: (fieldname, filename, req, res) => {
      return fieldname;
      },
      onFileUploadStart: (file, req, res) => {
        console.log(file.fieldname + ' is starting ...');
      },
      onFileUploadComplete: function (file, req, res) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
      }
    }));

    return server;
  }

  instance.create_local_server_test_site = (caps, app, server) => {
    
    if(app == undefined) app = express();
    if(server == undefined) {
      server = http(app);
      server.__express__ = app;
    }
    if(caps == undefined)
      throw new Error("Capabilities undefined");
    
    caps.intentURL = caps.intentURL || instance.create_intent_url(caps);
    if(caps.intentURL == undefined)
       throw new Error("Capabilities intentURL undefined");

    app.get("/test", (req, res) => {
      let div = dom('div.main', dom('<a href="'+caps.intentURL+'">', 'Open app'));
      res.send(div.toHTML());
    });
    
    return server;
  }

  // CLI mode
  instance.run_cli = (caps) => {
   
    let quit = (msg) => {
      console.log(msg);
      setTimeout( () => { process.exit(0); }, 500);
    }
    caps.success = () => {
      quit("TEST OK".green);
    }
    caps.failed  = () => {
      quit("TEST FAILED".red);
    }

    if(caps.test_site == "local") {
      let server = instance.create_local_server_test_site(caps);
      server.listen(port, '0.0.0.0', function(err){ console.log(err); });
    }
    
    try { instance.test(caps); }
    catch(e) {
      console.log(e);
      process.exit(1);
    }
  }

  // Electron.js ap & browser app
  instance.run_server = () => {
     
    let server = instance.create_local_server_app();
    let io = sockets(server);
    io.on('connection', socket => {
      
      let log = (msg) => { socket.emit("log", {msg: msg}); }
      let fail = (msg) => {
        log(msg);
        log("TEST FAILED");
        socket.emit("available for testing");
        socket.emit("test failed");
      }
      let success = () => {
        log("TEST OK");
        socket.emit("available for testing");
        socket.emit("test ok");
      }
      socket.emit("available for testing");
      socket.on("test", caps => {
      
        caps.success = success;
        caps.failed = fail;
        caps.log = log;

        if(caps.test_site == "local") {
          instance.create_local_server_test_site(caps, server.__express__, server);
        }

        try { instance.test(caps); }
        catch(e) {
          fail(e.toString());
        }
      });
    });

    server.listen(port, '0.0.0.0', function(err){
      let server_url = 'http://0.0.0.0';
      if(port) server_url += ":"+port;
    
      if(open != undefined && open) {
        require('openurl').open(server_url);
      }
      if(cb != undefined) return cb({url:server_url, err:err});
      if(err) {
        console.log(err);
        process.exit(1);
      }
    });

  }

  instance.run = () => {
    if(instance.capabilities) instance.run_cli(instance.capabilities);
    else instance.run_server();
  }
    
  return instance;
}
