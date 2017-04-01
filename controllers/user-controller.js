"use strict";

const AuthenticationController = require('./authentication-controller');
const User = require('../models').user;
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'UserController'});

const createUserDiff = (req) => {
  let changes = {};
  let fields = [];
  if (req.params.username && req.decoded.username !== req.params.username) {
    changes.username = req.params.username;
    fields.push('username');
  }
  if (req.params.password && req.decoded.password !== req.params.password) {
    changes.password = req.params.password;
    fields.push('password');
  }
  if (req.params.email && req.decoded.email !== req.params.email) {
    changes.email = req.params.email;
    fields.push('email');
  }
  if (req.params.phoneNumber && req.decoded.phoneNumber !== req.params.phoneNumber) {
    changes.phoneNumber = req.params.phoneNumber;
    fields.push('phoneNumber');
  }
  return { changes, fields };
};

const logAndSendError = (res, next) => {
  return (error) => {
    log.error(error);
    res.json(500, { success: false, error });
    return next(false);
  };
};

module.exports = class UserController {

  static getMe(req, res, next) {
    User.findOne({
      where: { id: req.decoded.id }
    }).then(function(user) {
      if (!user) {
        res.status(404).send({ success: false, message: 'User not found.' });
        return next(false);
      }
      res.json({success: true, user});
      return next();
    }).catch(logAndSendError(res, next));
  }

  static createUser(req, res, next) {
    // TODO: validate input
    const username = req.params.username;
    const password = req.params.password;
    const email = req.params.email;
    const phoneNumber = req.params.phone_number;

    let user = User.build({
      username,
      password,
      email,
      phoneNumber
    });

    user.save().then(function(savedUser) {
      res.json(200, { success: true, user: savedUser });
    });
    return next();
  }

  // TODO: better way to do this?
  // TODO: new JWT
  static updateUser(req, res, next) {
    const { changes, fields } = createUserDiff(req);

    if (changes.username || changes.email) {
      User.findOne({
        where: { $or: [
          { username: req.params.username },
          { email: req.params.email }
        ]}
      }).then((user) => {
        if (user) {
          res.json(400, { success: false, message: 'Username or Email is already taken.' });
          return next(false);
        }
        User.findOne({
          where: {
            id: req.decoded.id
          }
        }).then((user) => {
          user.update(changes, { fields }).then((updatedUser) => {
            const newToken = AuthenticationController.createJwtForUser(updatedUser);
            res.json(200, { success: true, user: updatedUser, token: newToken });
            return next();
          });
        }).catch(logAndSendError(res, next));
      });
    } else {
      User.findOne({
        where: {
          id: req.decoded.id
        }
      }).then((user) => {
        user.update(changes, { fields }).then((updatedUser) => {
          const newToken = AuthenticationController.createJwtForUser(updatedUser);
          res.json(200, { success: true, user: updatedUser, token: newToken });
          return next();
        });
      }).catch(logAndSendError(res, next));
    }
  }

  static getUserById(req, res, next) {
    User.findOne({
      where: { id: req.params.id }
    }).then(function(user) {
      if (!user) {
        res.status(404).send({ success: false, message: 'User not found.' });
        return next(false);
      }
      res.json({success: true, user});
    }).catch(logAndSendError(res, next)).then(function() {
      return next();
    });
  }
};
