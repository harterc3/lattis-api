"use strict";

const User = require('../models').user;
const jwt = require('jsonwebtoken');
const config = require('config');
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'AuthenticationController'});

module.exports = class AuthenticationController {

  static authenticate(req, res, next) {
    User.findOne({
      where: {username: req.params.username}
    }).then(function (user) {
      if (!user) {
        res.json({success: false, message: 'Authentication failed. User not found.'});
        return next(false);
      }
      if (!user.hasCorrectPassword(req.params.password)) {
        res.json({success: false, message: 'Authentication failed. Wrong password.'});
        return next(false);
      }
      const token = jwt.sign(user.dataValues, config.secret, {
        expiresIn: 3600
      });
      res.json({
        success: true,
        token: token
      });
    }).catch(function (error) {
      log.error(error);
    }).then(function () {
      return next();
    });
  }
};
