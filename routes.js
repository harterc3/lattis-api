"use strict";

// custom middleware
const Authenticator = require('./middleware/authenticator');
const LockHydrator = require('./middleware/hydrators/lock-hydrator');

// controllers
const LockController = require('./controllers/lock-controller');
const UserController = require('./controllers/user-controller');


module.exports = function(server) {
  const userController = new UserController();
  const lockController = new LockController();

  // register new user
  server.post({ url: '/users', validation: {
    resources: {
      username: { isString: true, isRequired: true },
      password: { isString: true, isRequired: true },
      email: { isEmail: true, isRequired: true },
      phone_number: { isString: true, isRequired: true }
    }
  }}, userController.createUser());

  // authenticate an existing user
  server.post({ url: '/authenticate', validation: {
    resources: {
      username: { isString: true, isRequired: true },
      password: { isString: true, isRequired: true }
    }
  }}, userController.authenticateUser());

  // for the rest of the endpoints, make sure the user has access token
  server.use(Authenticator.verifyUser);

  // get info about current user
  server.get({ url: '/me', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    }
  }}, userController.getMe());

  // update current user
  server.put({ url: '/me', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      username: { isString: true, isRequired: false },
      password: { isString: true, isRequired: false },
      email: { isEmail: true, isRequired: false },
      phone_number: { isString: true, isRequired: false }
    }
  }}, userController.updateUser());

  // get locks owned by current user
  server.get({ url: '/locks', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    }
  }}, lockController.getLocks());

  // create new lock for current user
  server.post({ url: '/locks', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      mac_id: { isString: true, isRequired: true },
      name: { isString: true, isRequired: true }
    }
  }}, lockController.createLock());

  // update a lock
  server.put({ url: '/locks/:id', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      id: { isString: true, isRequired: true },
      name: { isString: true, isRequired: true }
    }
  }}, LockHydrator.hydrate('id'), lockController.updateLock());

  // delete a lock
  server.del({ url: '/locks/:id', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      id: { isString: true, isRequired: true }
    }
  }}, LockHydrator.hydrate('id'), lockController.deleteLock());

  // share lock with phone number
  server.put({ url: '/locks/:id/share', validation: {
    headers: {
      "x-access-token": { isRequired: true }
    },
    resources: {
      id: { isString: true, isRequired: true },
      phone_number: { isString: true, isRequired: true }
    }
  }}, LockHydrator.hydrate('id'), lockController.shareLock());

  // base url
  server.get('/', function (req, res, next) {
    res.send('Welcome to Lattis!');
    return next();
  });
};
