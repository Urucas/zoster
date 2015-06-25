// es6 runtime requirements
require('babel/polyfill');
import express from 'express';
import { Server as http } from 'http';
import sockets from 'socket.io';
import ADB from 'adbjs';
import ar from 'appium-running';
import android_test from './scheme-test';
import iip from 'internal-ip';
import dom from 'vd';
import multer from 'multer';
import colors from 'colors';

export default function zoster({
  port = process.env.PORT,
  caps = null,
  cb  = null,
  open = undefined
  } = {}){
  
  let adb = new ADB();

  let get_devices = () => {
    let devices = [];
    try { devices = adb.devices();
    }catch(e){
      throw new Error("NO available devices, please connect your android!");
    }
    if(!devices.length) {
      throw new Error("NO available devices, please connect your android!");
    }
    return devices;
  }

  let exit_error = (err) => {
    console.log(err.toString());
    process.exit(0);
  }

  let install_apk = (data) => {
    try {
      if(!adb.install(data.apk_path, data.pkg)) {
        throw new Error("Error installing app("+data.pkg+")");
      }
    }catch(e){
      throw new Error("Error installing app("+data.pkg+")");
    }
  }

  let is_package_installed = (data) => {
    if(!adb.isPackageInstalled(data.pkg)){
      return false;
    }
    return true;
  }

  let stringify_params = (params) => {
    let strParams = [];
    for(let k in params) {
      if(params[k].name == "" || params[k].name == undefined) continue;
      strParams.push(params[k].name+"="+params[k].value);
    }
    return strParams.join('&');
  }
  
  let create_intent_url = (data) => {
    let params = stringify_params(data.params);
    return [
      "intent://",
      data.scheme,
      '/',
      data.action,
      '?',
      params,
      '#Intent;scheme=',
      data.scheme,
      ';package=',
      data.pkg,
      ';end'
    ].join('');
  }

  let test = (data) => {
   
    // TODO - add caps validation

    let log   = data.log || console.log;
    let error = data.err || exit_error;
    data.port = 4723;
    data.intentURL = data.intentURL || create_intent_url(data);
    
    log("Getting available devices");
    let devices = [];
    try {
      devices = get_devices();
    }catch(e) {
      error(e);
      return;
    }
    log("Using device ("+devices[0]+")");
    if(data.apk_upload) {
      data.apk_path = [__dirname, "/tmp-apk/", data.pkg, ".apk"].join("");
      log("Installing package ("+data.pkg+")");
      try { install_apk(data); }catch(e) {
        error(e);
        return;
      }
    }else{
      log("Checking package ("+data.pkg+") is installed");
      if(!is_package_installed(data)) {
        error("Package ("+data.pkg+") not installed. Please install your app first!");
        return;
      }
      log("Package ("+data.pkg+") installed! Move Along!");
    }

    if(adb.isAppRunning(data.pkg)) {
      log("Closing app");
      adb.closeApp(data.pkg);
    }
    
    log("Checking Appium is running");
    ar(4723, (success) => {
      if(!success) {
        error("Appium is not running, please run: appium &");
        return;
      }

      log("Appium is running! Keep going!");
      
      let test_site = data.test_site == "" ? "local" : data.test_site;
      if(test_site == "local") {
        let ip = iip();
        data.url = "http://"+ip+":"+port+"/test";
        data.local = true;
      }else {
        data.url = test_site;
        data.local = false;
      }
      data.adb = adb;
      data.cb = (success) => {
        if(success){
          data.success();
          return;
        }
        data.failed();
      };

      try { android_test(data); }
      catch(e) {
        console.log(e);
        error(e.toString);
      }
      
    });
    
  };
  
  
  let create_local_server_app = () => {
    
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

  let create_local_server_test_site = (caps, app, server) => {
    
    if(app == undefined) app = express();
    if(server == undefined) server = http(app);

    app.get("/test", (req, res) => {
      let div = dom('div.main', dom('<a href="#test" onclick="window.open(\''+caps.intentURL+'\');">', 'Open app'));
      res.send(div.toHTML());
    });
    
    return server;
  }

  /* zoster runs in three different modes
   * 1. Inside an electron.js app
   * 2. Directly on your browser
   * 3. As CLI
   */
  
  // CLI mode
  if(caps) {
    caps.success = () => {
      console.log("TEST OK".green);
      process.exit(0);
    }
    caps.failed  = () => {
      console.log("TEST FAILED".red);
      process.exit(0);
    }

    if(caps.test_site == "local") {
      let server = create_local_server_test_site(caps);
      server.listen(port, '0.0.0.0', function(err){ console.log(err); });
    }

    try { test(caps); }
    catch(e) {
      console.log(e);
      process.exit(1);
    }
    return;
  }

  // Electron.js ap & browser app
  let server = create_local_server_app();
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
        create_local_server_test_site(caps, server.__express__, server);
      }

      try { test(caps); }
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
