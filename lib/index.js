// es6 runtime requirements
require('babel/polyfill');

import express from 'express';
import { Server as http } from 'http';

export default function service(){
  
  let app = express();
  let server = http(app);
  
  // static files
  app.use(express.static(__dirname + '/../public'));
  app.get("/", (req, res) => {
   
    res.sendFile(__dirname + '/../public/index.html');
  });

  return server;
}
