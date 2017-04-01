"use strict";

const restify = require('restify');
const bunyan = require('bunyan');

const server = restify.createServer({
  name: "Lattis API"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({}));

server.on('uncaughtException', restify.auditLogger({
  log: bunyan.createLogger({
    name: 'UncaughtException',
    stream: process.stdout
  })
}));

server.on('after', restify.auditLogger({
  log: bunyan.createLogger({
    name: 'Audit',
    stream: process.stdout
  })
}));

module.exports = server;

require('./routes')(server);
