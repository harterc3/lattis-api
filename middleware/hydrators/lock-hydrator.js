"use strict";

const models = require('../../models');
const Lock = models.lock;
const User = models.user;
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'LockHydrator'});

// handling errors we catch
const logAndSendError = (error, res, next) => {
  log.error(error);
  res.json(500, { success: false, error: error.message });
  return next(false);
};

module.exports = class LockHydrator {
  static hydrate(lockIdParamName, includeAssociations = false) {
    return async function(req, res, next) {
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

      let lock = null;
      try {
        lock = await Lock.findOne(query);
      } catch (error) {
        logAndSendError(error, res, next)
      }

      if (!lock) {
        res.json(404, {success: false, error: 'Lock not found.'});
        return next(false);
      }

      req.lock = lock;
      return next();
    };
  }
};
