"use strict";
const conf = require("./conf");

const express = require("express");
const app = express();
const http = require("http").Server(app);
const session = require('express-session');
const bodyParser = require('body-parser');
const WebSocketServer = require("ws").Server;
const protos = [ "x-afb-ws-json1" ];
const wss = new WebSocketServer({server: http}, protos);
let connections = [];

function checkAuth(req, res, next) {
  console.log('checkAuth ' + req.url);

  // don't serve those not logged in
  if (req.url !== '/login' && (!req.session || !req.session.authenticated)) {
    res.render('unauthorised', {status: 403});
    return;
  }

  next();
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(checkAuth);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//WEBSOCKET DECLARATION
wss.on("connection", (ws) => {
  connections.push(ws);
  console.log(`User connected! ${connections.length} socket(s) are connected now`);

  ws.on('message', function (message) {
    // console.log('received: %s', message);

    //WEBSOCKET CONTROLLERS
    require('./controllers/front-controller')(wss, ws, JSON.parse(message));
  });


  ws.on("close", function () {
    connections.splice(connections.indexOf(ws), 1);
    console.log(`User disconnected! ${connections.length} socket(s) are connected now`);
  });
});

require('./routes.js')(app);

http.on('request', app);
http.listen(conf.port, () => {
  console.log(`started on port ${conf.port}`);
});