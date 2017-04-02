"use strict";

const config = require('config');

const Authenticator = require('./middleware/authenticator');
const AuthenticationController = require('./controllers/authentication-controller');
const UserController = require('./controllers/user-controller');
const LockController = require('./controllers/lock-controller');
const LockHydrator = require('./middleware/hydrators/lock-hydrator');

module.exports = function(server) {

  // register new user
  //server.post('/users', UserController.createUser);

  server.post({ url: '/users', validation: {
    resources: {
      username: { isString: true, isRequired: true, min: 8 },
      password: { isString: true, isRequired: true, min: 8 },
      email: { isEmail: true, isRequired: true },
      phone_number: { isString: true, isRequired: true, min: 5, max: 11 }
    }
  }}, UserController.createUser);

  // authenticate an existing user
  //server.post('/authenticate', AuthenticationController.authenticate);

  server.post({ url: '/authenticate', validation: {
    resources: {
      username: { isString: true, isRequired: true, min: 8 },
      password: { isString: true, isRequired: true, min: 8 }
    }
  }}, AuthenticationController.authenticate);

  // for the rest of the endpoints, make sure the user has access token
  server.use(Authenticator.verifyUser);

  // get info about current user
  //server.get('/me', UserController.getMe);

  server.get({ url: '/me', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    }
  }}, UserController.getMe);

  // update current user
  //server.put('/me', UserController.updateUser);

  server.put({ url: '/me', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      username: { isString: true, isRequired: false, min: 8 },
      password: { isString: true, isRequired: false, min: 8 },
      email: { isEmail: true, isRequired: false },
      phone_number: { isString: true, isRequired: false, min: 5, max: 11 }
    }
  }}, UserController.updateUser);

  // get locks owned by current user
  //server.get('/locks', LockController.getLocks);

  server.get({ url: '/locks', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    }
  }}, LockController.getLocks);

  // create new lock for current user
  //server.post('/locks', LockController.createLock);

  server.post({ url: '/locks', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      mac_id: { isString: true, isRequired: true },
      name: { isString: true, isRequired: true }
    }
  }}, LockController.createLock);

  // update a lock
  //server.put('/locks/:id', LockHydrator.hydrate('id'), LockController.updateLock);

  server.put({ url: '/locks/:id', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      id: { isString: true, isRequired: true },
      name: { isString: true, isRequired: true }
    }
  }}, LockHydrator.hydrate('id'), LockController.updateLock);

  // delete a lock
  //server.del('/locks/:id', LockHydrator.hydrate('id'), LockController.deleteLock);

  server.del({ url: '/locks/:id', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      id: { isString: true, isRequired: true }
    }
  }}, LockHydrator.hydrate('id'), LockController.deleteLock);

  // share lock with phone number
  //server.put('/locks/:id/share', LockHydrator.hydrate('id'), LockController.shareLock);

  server.put({ url: '/locks/:id/share', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      id: { isString: true, isRequired: true },
      phone_number: { isString: true, isRequired: true, min: 5, max: 11 }
    }
  }}, LockHydrator.hydrate('id'), LockController.shareLock);

  // base url
  server.get('/', function (req, res, next) {
    res.send('Welcome to Lattis!');
    return next();
  });
};
