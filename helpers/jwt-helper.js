"use strict";

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = class JwtHelper {

  static createJwt(object) {
    return jwt.sign(object, config.jsonWebToken.secret, {
      expiresIn: config.jsonWebToken.expiresIn
    });
  }

  static verifyJwt(token, callback) {
    return jwt.verify(token, config.jsonWebToken.secret, callback);
  }
};
