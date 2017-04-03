"use strict";

const ControllerBase = require('./controller-base');
const Lock = require('../models').lock;
const User = require('../models').user;

module.exports = class LockController extends ControllerBase {

  getLocks() {
    return (req, res, next) => {
      const self = this;
      User.findOne({
        where: {
          id: req.jwtUser.id
        },
        include: [{
          model: Lock, as: 'locks'
        }, {
          model: Lock, as: 'sharedLocks'
        }]
      }).then(function (userData) {
        if (!userData) {
          res.json(404, { success: false, error: 'User not found.' });
          return next(false);
        }
        res.json(200, {
          success: true,
          locks: {
            owned: userData.locks,
            shared: userData.sharedLocks
          }
        });
        return next();
      }).catch(self.logAndSendError(res, next));
    };
  }

  createLock() {
    return (req, res, next) => {
      const name = req.params.name;
      const macId = req.params.mac_id;

      const self = this;
      User.findOne({
        where: {
          id: req.jwtUser.id
        }
      }).then((user) => {
        if (!user) {
          res.json(404, { success: false, error: 'User not found.'});
          return next(false);
        }
        Lock.create({
          name,
          macId,
          ownerId: user.id
        }).then((lock) => {
          if (!lock) {
            res.json(400, { success: false, error: 'Lock creation failed.'});
            return next(false);
          }
          user.addLock(lock).then(() => {
            res.json(201, {success: true, lock});
            return next();
          }).catch(self.logAndSendError(res, next));
        }).catch(self.logAndSendError(res, next));
      }).catch(self.logAndSendError(res, next));
    };
  }

  updateLock() {
    return (req, res, next) => {
      const newName = req.params.name;
      if (!req.lock) {
        res.json(404, {success: false, error: 'Lock not found.'});
        return next(false);
      }
      if (req.lock.ownerId !== req.jwtUser.id) {
        res.json(403, {success: false, error: 'Access Forbidden'});
        return next(false);
      }
      if (req.lock.name === newName) {
        res.json(200, {success: true, lock: req.lock});
        return next(false);
      }

      const self = this;
      req.lock.update({
        name: newName
      }, {fields: ['name']}).then((updatedLock) => {
        if (!updatedLock) {
          res.json(400, { success: false, error: 'Lock update failed.' });
          return next(false);
        }
        res.json(200, {success: true, updatedLock});
        return next();
      }, self.logAndSendError(res, next));
    };
  }

  deleteLock() {
    return (req, res, next) => {
      if (req.lock.ownerId !== req.jwtUser.id) {
        res.json(403, {success: false, error: 'Access Forbidden'});
        return next(false);
      }

      const self = this;
      Lock.destroy({
        where: {macId: req.params.id}
      }).then(() => {
        res.json(200, {success: true});
        return next();
      }).catch(self.logAndSendError(res, next));
    };
  }

  shareLock() {
    return (req, res, next) => {
      if (req.lock.ownerId !== req.jwtUser.id) {
        res.json(403, {success: false, error: 'Access Forbidden'});
        return next(false);
      }

      const phoneNumber = req.params.phone_number;
      const self = this;
      User.findOne({
        where: {
          phoneNumber
        }
      }).then(function (user) {
        if (!user) {
          res.json(404, {success: false, message: 'User not found.'});
          return next(false);
        }
        req.lock.addUser(user).then((lock) => {
          res.json(200, {success: true, lock});
          return next();
        }).catch(self.logAndSendError(res, next));
        return next();
      }).catch(self.logAndSendError(res, next));
    };
  }
};
