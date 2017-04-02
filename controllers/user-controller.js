"use strict";

const ControllerBase = require('./controller-base');
const JwtHelper = require('../helpers/jwt-helper');
const User = require('../models').user;

// when updating user info, find out which fields the user wants updated
const createUserDiff = (req) => {
  let changes = {};
  let fields = [];
  if (req.params.username && req.jwtUser.username !== req.params.username) {
    changes.username = req.params.username;
    fields.push('username');
  }
  if (req.params.password && req.jwtUser.password !== req.params.password) {
    changes.password = req.params.password;
    fields.push('password');
  }
  if (req.params.email && req.jwtUser.email !== req.params.email) {
    changes.email = req.params.email;
    fields.push('email');
  }
  if (req.params.phoneNumber && req.jwtUser.phoneNumber !== req.params.phoneNumber) {
    changes.phoneNumber = req.params.phoneNumber;
    fields.push('phoneNumber');
  }
  return { changes, fields };
};

module.exports = class UserController extends ControllerBase {

  authenticateUser() {
    return (req, res, next) => {
      const self = this;
      User.findOne({
        where: {username: req.params.username}
      }).then((user) => {
        if (!user) {
          res.json({success: false, error: 'Authentication failed. User not found.'});
          return next(false);
        }
        if (!user.hasCorrectPassword(req.params.password)) {
          res.json({success: false, error: 'Authentication failed. Wrong password.'});
          return next(false);
        }
        const token = JwtHelper.createJwt(user.dataValues);
        res.json({
          success: true,
          token: token
        });
        return next();
      }).catch(self.logAndSendError(res, next));
    };
  }

  getMe() {
    return (req, res, next) => {
      const self = this;
      User.findOne({
        where: {id: req.jwtUser.id}
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
       id: req.jwtUser.id
       }
       }).then((user) => {
       user.update(changes, { fields }).then((updatedUser) => {
       const newToken = JwtHelper.createJwt(updatedUser);
       res.json(200, { success: true, user: updatedUser, token: newToken });
       return next();
       });
       }).catch(self.logAndSendError(res, next));
       });
       } else {*/
      User.findOne({
        where: {
          id: req.jwtUser.id
        }
      }).then((user) => {
        user.update(changes, {fields}).then((updatedUser) => {
          const newToken = JwtHelper.createJwt(updatedUser.dataValues);
          res.json(200, {success: true, user: updatedUser, token: newToken});
          return next();
        }, self.logAndSendError(res, next));
      }).catch(self.logAndSendError(res, next));
      //}
    };
  }
};
