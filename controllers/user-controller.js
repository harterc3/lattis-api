"use strict";

const User = require('../models').user;
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'UserController'});

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
    }).catch(function(error) {
      log.error(error);
      res.json(500, { success: false, error });
      return next(false);
    });
  }

  static createUser(req, res, next) {
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
    if (req.decoded.username !== req.params.username || req.decoded.email !== req.params.email) {
      User.findOne({
        where: { $or: [
          { username: req.params.username },
          { email: req.params.email }
        ]}
      }).then((user) => {
        if (user) {
          res.json(400, {success: true, user});
          return next(false);
        }
        User.update({
          username: req.params.username,
          password: req.params.password,
          email: req.params.email,
          phoneNumber: req.params.phone_number
        }, {
          where: { id: req.decoded.id}
        }).then((updatedUser) => {
          res.json(200, {success: true, user: updatedUser});
        }).catch((error) => {
          log.error(error);
        }).then(() => {
          return next();
        });
      });
    } else {
      User.update({
        password: req.params.password,
        phoneNumber: req.params.phone_number
      }, {
        where: { id: req.decoded.id}
      }).then((updatedUser) => {
        res.json(200, {success: true, user: updatedUser});
      }).catch((error) => {
        log.error(error);
      }).then(() => {
        return next();
      });
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
    }).catch(function(error) {
      log.error(error);
    }).then(function() {
      return next();
    });
  }
};
