"use strict";

const ControllerBase = require('./controller-base');
const AuthenticationController = require('./authentication-controller');
const User = require('../models').user;

// when updating user info, find out which fields the user wants updated
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

module.exports = class UserController extends ControllerBase {

  getMe() {
    return (req, res, next) => {
      const self = this;
      User.findOne({
        where: {id: req.decoded.id}
      }).then(function (user) {
        if (!user) {
          res.status(404).send({success: false, message: 'User not found.'});
          return next(false);
        }
        res.json({success: true, user});
        return next();
      }).catch(self.logAndSendError(res, next));
    };
  }

  createUser() {
    return (req, res, next) => {
      let user = User.build({
        username: req.params.username,
        password: req.params.password,
        email: req.params.email,
        phoneNumber: req.params.phone_number
      });

      const self = this;
      user.save().then(function (savedUser) {
        if (!savedUser) {
          res.json(400, {success: false, message: 'User could not be created.'});
          return next(false);
        }
        res.json(200, {success: true, user: savedUser});
      }).catch(self.logAndSendError(res, next));
      return next();
    };
  }

  // TODO: better way to do this?
  updateUser() {
    return (req, res, next) => {
      const {changes, fields} = createUserDiff(req);
      const self = this;
      /*
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
       }).catch(self.logAndSendError(res, next));
       });
       } else {*/
      User.findOne({
        where: {
          id: req.decoded.id
        }
      }).then((user) => {
        user.update(changes, {fields}).then((updatedUser) => {
          const newToken = AuthenticationController.createJwtForUser(updatedUser.dataValues);
          res.json(200, {success: true, user: updatedUser, token: newToken});
          return next();
        }, self.logAndSendError(res, next));
      }).catch(self.logAndSendError(res, next));
      //}
    };
  }

  getUserById() {
    return (req, res, next) => {
      const self = this;
      User.findOne({
        where: {id: req.params.id}
      }).then(function (user) {
        if (!user) {
          res.status(404).send({success: false, message: 'User not found.'});
          return next(false);
        }
        res.json({success: true, user});
      }).catch(self.logAndSendError(res, next)).then(function () {
        return next();
      });
    }
  }
};
