"use strict";

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = class Authenticator {

  static verifyUser(req, res, next) {
    const token = req.params.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, config.jsonWebToken.secret, (err, decoded) => {
        if (err) {
          res.json({success: false, message: 'Failed to authenticate token.'});
          return next(false);
        }
        req.decoded = decoded;
        return next();
      });
    } else {
      res.json(403, {
        success: false,
        message: 'No token provided.'
      });
      return next(false);
    }
  }

};
