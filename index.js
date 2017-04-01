"use strict";

const server = require('./server');

const port = Number(process.env.SERVER_PORT) || 3000;

server.listen(port, function() {
  console.log('Lattis API server listening on %j', server.address());
});
