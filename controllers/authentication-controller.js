"use strict";

const ControllerBase = require('./controller-base');
const User = require('../models').user;
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = class AuthenticationController extends ControllerBase {

  authenticate() {
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
        const token = AuthenticationController.createJwtForUser(user.dataValues);
        res.json({
          success: true,
          token: token
        });
        return next();
      }).catch(self.logAndSendError(res, next));
    };
  }

  static createJwtForUser(userValues) {
    return jwt.sign(userValues, config.jsonWebToken.secret, {
      expiresIn: config.jsonWebToken.expiresIn
    });
  }
};
