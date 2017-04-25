"use strict";

const ControllerBase = require('./controller-base');
const Lock = require('../models').lock;
const User = require('../models').user;

module.exports = class LockController extends ControllerBase {

  getLocks() {
    return async (req, res, next) => {
      let userData = null;
      try {
        userData = await User.findOne({
          where: {
            id: req.jwtUser.id
          },
          include: [{
            model: Lock, as: 'locks'
          }, {
            model: Lock, as: 'sharedLocks'
          }]
        });
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

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
    };
  }

  // TODO: this method does too much
  createLock() {
    return async (req, res, next) => {
      const name = req.params.name;
      const macId = req.params.mac_id;

      // find current user
      let user = null;
      try {
        user = await User.findOne({
          where: {
            id: req.jwtUser.id
          }
        });
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      if (!user) {
        res.json(404, { success: false, error: 'User not found.'});
        return next(false);
      }

      // create new lock
      let lock = null;
      try {
        lock = await Lock.create({
          name,
          macId,
          ownerId: user.id
        });
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      if (!lock) {
        res.json(400, { success: false, error: 'Lock creation failed.'});
        return next(false);
      }

      try {
        await user.addLock(lock);
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      res.json(201, {success: true, lock});
      return next();
    };
  }

  updateLock() {
    return async (req, res, next) => {
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

      let updatedLock = null;
      try {
        updatedLock = await req.lock.update({
          name: newName
        }, {fields: ['name']});
      } catch (error) {
        this.logAndSendError(error, res, next)
      }

      if (!updatedLock) {
        res.json(400, { success: false, error: 'Lock update failed.' });
        return next(false);
      }

      res.json(200, {success: true, updatedLock});
      return next();
    };
  }

  deleteLock() {
    return async (req, res, next) => {
      if (req.lock.ownerId !== req.jwtUser.id) {
        res.json(403, {success: false, error: 'Access Forbidden'});
        return next(false);
      }

      try {
        await Lock.destroy({
          where: {macId: req.params.id}
        });
      } catch (error) {
        this.logAndSendError(error, res, next)
      }

      res.json(200, {success: true});
      return next();
    };
  }

  shareLock() {
    return async (req, res, next) => {
      if (req.lock.ownerId !== req.jwtUser.id) {
        res.json(403, {success: false, error: 'Access Forbidden'});
        return next(false);
      }

      const phoneNumber = req.params.phone_number;

      let user = null;
      try {
        user = await User.findOne({
          where: {
            phoneNumber
          }
        });
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      if (!user) {
        res.json(404, {success: false, message: 'User not found.'});
        return next(false);
      }

      let lock = null;
      try {
        lock = await req.lock.addUser(user);
      } catch (error) {
        this.logAndSendError(error, res, next);
      }

      res.json(200, {success: true, lock});
      return next();
    };
  }
};
