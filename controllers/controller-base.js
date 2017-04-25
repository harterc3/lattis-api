"use strict";

const bunyan = require('bunyan');

module.exports = class ControllerBase {
  constructor() {
    this.log = bunyan.createLogger({ name: this.constructor.name });
  }

  /**
   *
   * @param error
   * @param res
   * @param next
   * @returns {*}
   */
  logAndSendError(error, res, next) {
    this.log.error(error);
    res.json(500, { success: false, error: error.message });
    return next(false);
  };
};
