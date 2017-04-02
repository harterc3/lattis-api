"use strict";

const models = require('../../models');
const Lock = models.lock;
const User = models.user;
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'LockHydrator'});

// handling errors we catch
const logAndSendError = (res, next) => {
  return (error) => {
    log.error(error);
    res.json(500, { success: false, error: error.message });
    return next(false);
  };
};

module.exports = class LockHydrator {
  static hydrate(lockIdParamName, includeAssociations = false) {
    return function(req, res, next) {
      let lockId = req.params[lockIdParamName];
      req.lock = null;
      if (!lockId) {
        res.json(400, { success: false, message: 'No lockId route parameter.' });
        return next(false);
      }

      let query = {
        where: {
          macId: lockId
        }
      };

      if (includeAssociations) {
        query.include = [{
          model: User, as: 'user'
        }];
      }

      Lock.findOne(query).then(function(lock) {
        req.lock = lock;
        return next();
      }).catch(logAndSendError(res, next));
    };
  }
};
