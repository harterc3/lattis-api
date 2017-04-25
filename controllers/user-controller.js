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
    return async (req, res, next) => {
      let user = null;
      try {
        user = await User.findOne({
          where: { username: req.params.username }
        });
      } catch (error) {
        this.logAndSendError(error, res, next)
      }

      if (!user) {
        res.json(404, { success: false, error: 'Authentication failed. User not found.' });
        return next(false);
      }
      if (!user.hasCorrectPassword(req.params.password)) {
        res.json(400, { success: false, error: 'Authentication failed. Wrong password.' });
        return next(false);
      }

      const token = JwtHelper.createJwt(user.dataValues);
      res.json(200, {
        success: true,
        token: token
      });
      return next();
    };
  }

  getMe() {
    return async (req, res, next) => {
      let user = null;
      try {
        user = await User.findOne({
          where: {id: req.jwtUser.id}
        });
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      if (!user) {
        res.json(404, {success: false, message: 'User not found.'});
        return next(false);
      }

      res.json(200, { success: true, user });
      return next();
    };
  }

  createUser() {
    return async (req, res, next) => {
      let user = User.build({
        username: req.params.username,
        password: req.params.password,
        email: req.params.email,
        phoneNumber: req.params.phone_number
      });

      let savedUser = null;
      try {
        savedUser = await user.save();
      } catch (error) {
        this.logAndSendError(error, res, next)
      }

      if (!savedUser) {
        res.json(400, {success: false, message: 'User could not be created.'});
        return next(false);
      }

      res.json(201, {success: true, user: savedUser});
      return next();
    };
  }

  updateUser() {
    return async (req, res, next) => {
      const {changes, fields} = createUserDiff(req);

      let user = null;
      try {
        user = await User.findOne({
          where: {
            id: req.jwtUser.id
          }
        });
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      if (!user) {
        res.json(404, {success: false, message: 'User not found.'});
        return next(false);
      }

      let updatedUser = null;
      try {
        updatedUser = await user.update(changes, {fields});
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      if (!updatedUser) {
        res.json(400, {success: false, message: 'User could not be updated.'});
        return next(false);
      }

      const newToken = JwtHelper.createJwt(updatedUser.dataValues);
      res.json(200, {success: true, user: updatedUser, token: newToken});
      return next();
    };
  }
};
