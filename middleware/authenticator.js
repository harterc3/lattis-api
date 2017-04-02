"use strict";

const jwtHelper = require('../helpers/jwt-helper');

module.exports = class Authenticator {

  static verifyUser(req, res, next) {
    // get access token from request header
    const token = req.params.token || req.headers['x-access-token'];
    if (token) {
      jwtHelper.verifyJwt(token, (err, jwtUser) => {
        if (err) {
          res.json({success: false, message: 'Failed to authenticate token.'});
          return next(false);
        }
        req.jwtUser = jwtUser;
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
