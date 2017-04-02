"use strict";

const Lock = require('../models').lock;
const User = require('../models').user;
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'LockController'});

// handling errors we catch
const logAndSendError = (res, next) => {
  return (error) => {
    log.error(error);
    res.json(500, { success: false, error: error.message });
    return next(false);
  };
};

module.exports = class LockController {

  static getLocks(req, res, next) {
    User.findOne({
      where: {
        id: req.decoded.id
      },
      include: [{
        model: Lock, as: 'locks'
      }, {
        model: Lock, as: 'sharedLocks'
      }]
    }).then(function(userData) {
      res.json({
        success: true,
        locks:{
          owned: userData.locks,
          shared: userData.sharedLocks
        }
      });
      return next();
    }).catch(logAndSendError(res, next));
  }

  static createLock(req, res, next) {
    const name = req.params.name;
    const macId = req.params.mac_id;

    User.findOne({
      where: {
        id: req.decoded.id
      }
    }).then((user) => {
      if (!user) {
        return next(false);
      }
      Lock.create({
        name,
        macId,
        ownerId: user.id
      }).then((lock) => {
        if (!lock) {
          return next(false);
        }
        user.addLock(lock).then(() => {
          res.json(200, { success: true, lock });
          return next();
        }).catch(logAndSendError(res, next));
      }).catch(logAndSendError(res, next));
    }).catch(logAndSendError(res, next));
  }

  static updateLock(req, res, next) {
    const newName = req.params.name;
    if (!newName) {
      res.json(400, {success: false, error: 'No \'name\' parameter given.'});
      return next(false);
    }
    if (!req.lock) {
      return next(false);
    }
    if (req.lock.ownerId !== req.decoded.id) {
      res.json(400, {success: false, error: 'Access Forbidden'});
      return next(false);
    }
    if (req.lock.name === newName) {
      res.json(200, { success: true, lock: req.lock });
      return next();
    }
    req.lock.update({
      name: newName
    }, { fields: ['name'] }).then((updatedLock) => {
      res.json(200, { success: true, updatedLock });
      return next();
    }, logAndSendError(res, next));
  }

  static deleteLock(req, res, next) {
    if (req.lock.ownerId !== req.decoded.id) {
      res.json(400, {success: false, error: 'Access Forbidden'});
      return next(false);
    }
    Lock.destroy({
      where: { macId: req.params.id }
    }).then(() => {
      res.json(202, { success: true });
      return next();
    }).catch(logAndSendError(res, next));
  }

  static shareLock(req, res, next) {
    if (req.lock.ownerId !== req.decoded.id) {
      res.json(400, {success: false, error: 'Access Forbidden'});
      return next(false);
    }

    const phoneNumber = req.params.phone_number;
    User.findOne({
      where: {
        phoneNumber
      }
    }).then(function(user) {
      if (!user) {
        res.status(404).send({ success: false, message: 'User not found.' });
        return next(false);
      }
      req.lock.addUser(user).then((lock) => {
        res.json(200, { success: true, lock });
        return next();
      }).catch(logAndSendError(res, next));
      return next();
    }).catch(logAndSendError(res, next));
  }
};
