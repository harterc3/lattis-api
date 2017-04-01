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
    }).then((user) => {
      if (!user) {
        res.json({success: false, error: 'Authentication failed. User not found.'});
        return next(false);
      }
      if (!user.hasCorrectPassword(req.params.password)) {
        res.json({success: false, error: 'Authentication failed. Wrong password.'});
        return next(false);
      }
      const token = jwt.sign(user.dataValues, config.secret, {
        expiresIn: 3600
      });
      res.json({
        success: true,
        token: token
      });
      return next();
    }).catch((error) => {
      log.error(error);
      res.json(500, {
        success: false,
        error
      });
      return next(false);
    });
  }

  static createJwtForUser(user) {
    return jwt.sign(user.dataValues, config.secret, {
      expiresIn: 3600
    });
  }
};
