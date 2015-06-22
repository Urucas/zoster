// es6 runtime requirements
require('babel/polyfill');
import express from 'express';
import { Server as http } from 'http';
import sockets from 'socket.io';
import ADB from 'adbjs';
import ar from 'appium-running';
import test from './scheme-test';
import iip from 'internal-ip';
import dom from 'vd';
import multer from 'multer';

export default function zoster(port){
  
  let app = express();
  
  let server = http(app);
  let io = sockets(server);
  let adb = new ADB();
  let test_data;
  let socket;

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

  io.on('connection', socket => {
      
    let log = (msg) => {
      // console.log(msg);
      socket.emit("log", {msg: msg});
    }

    let finito = (msg) => {
      log(msg);
      // TODO - remove express test route
    }

    // log("socket connected");
    socket.emit("available for testing");
    
    socket.on("test", data => {
        
      test_data = data;
      test_data.port = 4723;
      log("Getting available devices");

      let devices = [];
      try {
        devices = adb.devices();
          
      }catch(e){
        log("NO available devices, please connect your android!");
        socket.emit("available for testing");
        socket.emit("test failed");
        return;
      }
       
      if(!devices.length) {
        log("NO available devices, please connect your android!");
        socket.emit("available for testing");
        socket.emit("test failed");
        return;
      }
      log("Using device ("+devices[0]+")");

      if(data.apk_upload) {
        log("Installing package ("+data.pkg+")");
        let apk_path = [__dirname, "/tmp-apk/", data.pkg, ".apk"].join("");
        console.log(apk_path);
        try {
          if(!adb.install(apk_path, data.pkg)) {
            log("Error installing app("+data.pkg+")");
            socket.emit("available for testing");
            socket.emit("test failed");
            return;
          }
          log("App("+data.pkg+" installed! Kepp moving");
        }catch(e){
          log("Error installing app("+data.pkg+")");
          log(e.getMessage());
          socket.emit("available for testing");
          socket.emit("test failed");
          return;
        }
      }
      
      else {
        log("Checking package ("+data.pkg+") is installed");
        if(!adb.isPackageInstalled(data.pkg)) {
          log("Package ("+data.pkg+") not installed. Please install your app first!");
          socket.emit("available for testing");
          socket.emit("test failed");
          return;
        }
      }
      
      log("Package ("+data.pkg+") installed! Move Along!");
        
      if(adb.isAppRunning(data.pkg)) {
        log("Closing app");
        adb.closeApp(data.pkg);
      }
        
      log("Checking Appium is running");
        
      ar(4723, (success) => {
        
        if(!success) {
          log("Appium is not running, please run: appium &");
          socket.emit("available for testing");
          socket.emit("test failed");
          return;
        }

        log("Appium is running! Keep going!");
         
        let test_site = test_data.test_site == "" ? "local" : test_data.test_site;
        if(test_site == "local") {
          log("Creating temporary route");
          
          if(data.wait4sdkEvent) {
            let intentURL = test_data.intentURL.split("#");
            intentURL[0] = intentURL[0] + "&socket=0.0.0.0"+port;
            intentURL.join("");
          }
          app.get("/test", (req, res) => {
            let div = dom('div.main', dom('<a href="#test" onclick="window.open(\''+test_data.intentURL+'\');">', 'Open app'));
            res.send(div.toHTML());
          });

          let ip = iip();
          test_data.url = "http://"+ip+":"+port+"/test";
          test_data.local = true;
          log(""+test_data.url);

        }else {
          test_data.url = test_site;
          test_data.local = false;
        }
      
        log("Running test");
        test_data.adb = adb;
        test_data.wait4sdkEvent = data.wait4sdkEvent ? true : false;
        test_data.cb = (success) => {
          log("Test "+ (success ? "OK" : "FAILED"));
          if(success) { 
            if(!data.wait4sdkEvent) { 
              socket.emit("test ok");
            }else{
              // wiat for app sdk to emit event
              let sdkEvent = false;
              socket.on("sdk event", () => {
                sdkEvent = true;
                socket.emit("test ok");
              });
              setTimeout( () => {
                if(!sdkEvent) socket.emit("test failed");
              }, 8000);
            }
          }
          else socket.emit("test failed");
        }
        
        test_data.logger = (message) => {
          // log(message);
        }

        try { test(test_data); }
        catch(e) {
          console.log(e);
          socket.emit("test failed");
        }
          
      });
    });
  });


  // static files
  app.use(express.static(__dirname + '/../public'));
  app.get("/", (req, res) => {
   
    res.sendFile(__dirname + '/../public/index.html');
  });

  app.post("/upload", (req, res) => {
    let files = req.files;
    res.json(req.files);
  });
  
  return server;
}
