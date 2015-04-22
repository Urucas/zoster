// es6 runtime requirements
require('babel/polyfill');
import express from 'express';
import { Server as http } from 'http';
import sockets from 'socket.io';
import ADB from './adb';
import ar from 'appium-running';
import test from './scheme-test';
import iip from 'internal-ip';
import dom from 'vd';

export default function service(port){
  
  let app = express();
  let server = http(app);
  let io = sockets(server);
  let adb = new ADB();
  let test_data;

  io.on('connection', socket => {
      
    let log = (msg) => {
      console.log(msg);
      socket.emit("log", {msg: msg});
    }

    let finito = (msg) => {
      log(msg);
      // TODO - remove express test route
    }

    log("socket connected");
    socket.emit("available for testing");
    
    socket.on("test", data => {
      
        test_data = data;
        test_data.port = 4723;
        log("getting available devices");

        let devices = adb.devices();
        log("available devices:" + devices);
        
        if(!devices.length) {
          log("no available devices, please connect your android device");
          socket.emit("available for testing");
          return;
        }
        
        log("checking package: "+data.pkg+" is installed");
        if(!adb.isPackageInstalled(data.pkg)) {
          log("package: "+data.pkg+" not installed");
          socket.emit("available for testing");
          return;
        }
        log("package: "+data.pkg+" is installed");
        
        log("checking appium is running");
        
        ar(4723, (success) => {
          if(!success) {
            log("Appium is not running, please run: appium &");
            socket.emit("available for testing");
            return;
          }

          log("Appium is running, creating test");
          
          let ip = iip();
          test_data.url = "http://"+ip+":"+port+"/test";
          log("Internal ip:"+test_data.url);
          
          log("Creating temporary route");
          app.get("/test", (req, res) => {
            let div = dom('div.main', dom('<a href="'+test_data.intentURL+'" onclick="alert(1)">','Open app'));
            res.send(div.toHTML());
          });

          log("Sending test");
          test(test_data);

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
