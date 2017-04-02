"use strict";

const restify = require('restify');
const restifyValidation = require('node-restify-validation');
const bunyan = require('bunyan');

const server = restify.createServer({
  name: "Lattis API"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({}));

server.use(restifyValidation.validationPlugin({
  errorsAsArray: true,
  forbidUndefinedVariables: false,
  errorHandler: restify.errors.InvalidArgumentError
}));

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
