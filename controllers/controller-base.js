"use strict";

const bunyan = require('bunyan');

module.exports = class ControllerBase {
  constructor() {
    this.log = bunyan.createLogger({ name: this.constructor.name });
  }

  // handling errors we catch
  logAndSendError(res, next) {
    const self = this;
    return (error) => {
      self.log.error(error);
      res.json(500, { success: false, error: error.message });
      return next(false);
    };
  };
};
