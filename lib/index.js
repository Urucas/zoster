// es6 runtime requirements
require('babel/polyfill');
import express from 'express';
import { Server as http } from 'http';
import sockets from 'socket.io';
import ADB from './adb';
import ar from 'appium-running';
import monocle from 'monocle-js';

export default function service(){
  
  let app = express();
  let server = http(app);
  let io = sockets(server);
  let adb = new ADB();

  io.on('connection', socket => {
      
    let log = (msg) => {
      console.log(msg);
      socket.emit("log", {msg: msg});
    }

    log("socket connected");
    
    socket.on("test", data => {
      
        log("getting available devices");

        let devices = adb.devices();
        log("available devices:" + devices);
        
        if(!devices.length) {
          log("no available devices, please connect your android device");
          return;
        }
        
        log("checking current package is installed");
        if(!adb.isPackageInstalled(data.pkg)) {
          log("package: "+data.pkg+" not installed");
          return;
        }
        log("package: "+data.pkg+" is installed");
        
        log("checking appium is running");
        
        ar(4723, (success) => {
          if(!success) {
            log("Appium is not running, please run: appium &");
            return;
          }

          log("Appium is running, creating test");
          // TODO - create test
          
        });
                

    });
  });


  // static files
  app.use(express.static(__dirname + '/../public'));
  app.get("/", (req, res) => {
   
    res.sendFile(__dirname + '/../public/index.html');
    
  });

  return server;
}
