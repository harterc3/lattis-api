"use strict";

const config = require('config');
const Authenticator = require('./middleware/authenticator');
const AuthenticationController = require('./controllers/authentication-controller');
const UserController = require('./controllers/user-controller');
const LockController = require('./controllers/lock-controller');
const LockHydrator = require('./middleware/hydrators/lock-hydrator');

module.exports = function(server) {

  // register new user
  server.post('/users', UserController.createUser);

  // authenticate an existing user
  server.post('/authenticate', AuthenticationController.authenticate);

  // for the rest of the endpoints, make sure the user has access token
  server.use(Authenticator.verifyUser);

  // get info about current user
  server.get('/me', UserController.getMe);

  // update current user
  server.put('/me', UserController.updateUser);

  // get locks owned by current user
  server.get('/locks', LockController.getLocks);

  // create new lock for current user
  server.post('/locks', LockController.createLock);

  // update a lock
  server.put('/locks/:id', LockHydrator.hydrate('id'), LockController.updateLock);

  // delete a lock
  server.del('/locks/:id', LockHydrator.hydrate('id'), LockController.deleteLock);

  // share lock with phone number
  server.put('/locks/:id/share', LockHydrator.hydrate('id'), LockController.shareLock);

  // base url
  server.get('/', function (req, res, next) {
    res.send('Welcome to Lattis!');
    return next();
  });
};
