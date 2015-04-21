// es6 runtime requirements
require('babel/polyfill');
import express from 'express';
import { Server as http } from 'http';
import sockets from 'socket.io';
import ADB from './adb';

export default function service(){
  
  let app = express();
  let server = http(app);
  let io = sockets(server);
  let adb = new ADB();
  let log = console.log;

  let isTesting = false;
  
  io.on('connection', socket => {
      
    socket.emit("log", {msg: "socket connected"});
    log("socket connected");
    socket.on("test", data => {
      
      try {
        let devices = adb.devices();
        socket.emit("log", {msg: "available devices:" + devices});
        log("available devices:" + devices);
        

      }catch(e){
        console.log(e);  
      }
    });
  });


  // static files
  app.use(express.static(__dirname + '/../public'));
  app.get("/", (req, res) => {
   
    res.sendFile(__dirname + '/../public/index.html');
    
  });

  return server;
}
