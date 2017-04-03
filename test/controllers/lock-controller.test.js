"use strict";

const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

describe('LockController', function() {

  beforeEach(function () {
    this.userFindOneStub = sinon.stub().returnsPromise();
    this.lockCreateStub = sinon.stub().returnsPromise();
    this.lockDestroyStub = sinon.stub().returnsPromise();

    const mockedController = proxyquire('../../controllers/lock-controller', {
      '../models': {
        user: {
          findOne: this.userFindOneStub
        },
        lock: {
          create: this.lockCreateStub,
          destroy: this.lockDestroyStub
        }
      }
    });

    this.controller = new mockedController();

    this.resJsonSpy = sinon.spy();
    this.res = {
      json: this.resJsonSpy
    };

    this.nextSpy = sinon.spy();
  });

  describe('#getLocks', function() {
    beforeEach(function() {
      this.func = this.controller.getLocks();
      expect(this.func).to.be.a('function');
    });

    it('should respond 404 if no user matches jwt', function(done) {
      const req = {
        jwtUser: { id: 1 }
      };
      this.userFindOneStub.resolves(null);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(404);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should respond 200 if a user is found', function(done) {
      const req = {
        jwtUser: { id: 1 }
      };
      const user = {
        id: 1,
        username: 'Cory',
        locks: [],
        sharedLocks: []
      };
      this.userFindOneStub.resolves(user);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });

  describe('#createLock', function() {
    beforeEach(function() {
      this.func = this.controller.createLock();
      expect(this.func).to.be.a('function');
    });

    it('should return 404 when current user is not found', function(done) {
      const lock = {
        name: 'A Lock',
        macId: 'abcd-1234'
      };
      const req = {
        jwtUser: { id: 1 },
        params: {
          name: lock.name,
          mac_id: lock.macId
        }
      };
      this.userFindOneStub.resolves(null);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(404);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 400 when lock creation fails', function(done) {
      const lock = {
        name: 'A Lock',
        macId: 'abcd-1234'
      };
      const req = {
        jwtUser: { id: 1 },
        params: {
          name: lock.name,
          mac_id: lock.macId
        }
      };
      const user = {
        id: 1,
        username: 'Cory',
        locks: [],
        sharedLocks: []
      };
      this.userFindOneStub.resolves(user);
      this.lockCreateStub.resolves(null);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(400);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 201 when lock is successfully created and added to user', function(done) {
      const lock = {
        name: 'A Lock',
        macId: 'abcd-1234'
      };
      const req = {
        jwtUser: { id: 1 },
        params: {
          name: lock.name,
          mac_id: lock.macId
        }
      };
      const user = {
        id: 1,
        username: 'Cory',
        locks: [],
        sharedLocks: []
      };
      const userAddLockStub = sinon.stub().returnsPromise().resolves(null);
      this.userFindOneStub.resolves(Object.assign({}, user, { addLock: userAddLockStub }));
      this.lockCreateStub.resolves(lock);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(201);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });

  describe('#updateLock', function() {
    beforeEach(function() {
      this.func = this.controller.updateLock();
      expect(this.func).to.be.a('function');
    });

    it('should return 404 when lock isn\'t found', function(done) {
      const req = {
        lock: null,
        jwtUser: { id: 1 },
        params: {
          name: 'Locknamemeee'
        }
      };

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(404);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 403 when jwt user isn\'t owner of lock', function(done) {
      const req = {
        lock: {
          ownerId: 2
        },
        jwtUser: { id: 1 },
        params: {
          name: 'Locknamemeee'
        }
      };

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(403);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 200 when new lock name is same as old name', function(done) {
      const req = {
        lock: {
          ownerId: 1,
          name: 'A Lock'
        },
        jwtUser: { id: 1 },
        params: {
          name: 'A Lock'
        }
      };

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 400 when lock update fails', function(done) {
      const lockUpdateStub = sinon.stub().returnsPromise().resolves(null);
      const req = {
        lock: {
          name: 'A Lock',
          macId: 'abcd-1234',
          ownerId: 1,
          update: lockUpdateStub
        },
        jwtUser: { id: 1 },
        params: {
          name: 'B Lock'
        }
      };

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(400);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 200 when lock is successfully updated', function(done) {
      const updatedLock = {
        name: 'B Lock',
        macId: 'abcd-1234',
        ownerId: 1
      };
      const lockUpdateStub = sinon.stub().returnsPromise().resolves(updatedLock);
      const req = {
        lock: {
          name: 'A Lock',
          macId: 'abcd-1234',
          ownerId: 1,
          update: lockUpdateStub
        },
        jwtUser: { id: 1 },
        params: {
          name: 'B Lock'
        }
      };

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });

  describe('#deleteLock', function() {
    beforeEach(function() {
      this.func = this.controller.deleteLock();
      expect(this.func).to.be.a('function');
    });

    it('should return 403 when user isn\'t owner of lock', function(done) {
      const req = {
        lock: {
          name: 'A Lock',
          macId: 'abcd-1234',
          ownerId: 2
        },
        jwtUser: { id: 1 },
        params: { id: 'abcd-1234' }
      };

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(403);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 200 when lock is successfully deleted', function(done) {
      this.lockDestroyStub.resolves(null);
      const req = {
        lock: {
          name: 'A Lock',
          macId: 'abcd-1234',
          ownerId: 1
        },
        jwtUser: { id: 1 },
        params: { id: 'abcd-1234' }
      };

      this.func(req, this.res, this.nextSpy);

      expect(this.lockDestroyStub).to.be.called;
      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });

  describe('#shareLock', function() {
    beforeEach(function() {
      this.func = this.controller.shareLock();
      expect(this.func).to.be.a('function');
    });

    it('should return 403 when user isn\'t owner of lock', function(done) {
      const req = {
        lock: {
          name: 'A Lock',
          macId: 'abcd-1234',
          ownerId: 2
        },
        jwtUser: { id: 1 },
        params: { phone_number: '5555555' }
      };

      this.func(req, this.res, this.nextSpy);
      expect(this.resJsonSpy).to.be.calledWith(403);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 404 when user is not found', function(done) {
      const lock = {
        name: 'A Lock',
        macId: 'abcd-1234',
        ownerId: 1
      };
      const req = {
        lock,
        jwtUser: { id: 1 },
        params: { phone_number: '5555555' }
      };
      this.userFindOneStub.resolves(null);

      this.func(req, this.res, this.nextSpy);

      expect(this.userFindOneStub).to.be.called;
      expect(this.resJsonSpy).to.be.calledWith(404);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should return 200 when lock is successfully shared', function(done) {
      const lockAddUserStub = sinon.stub().returnsPromise();
      const lock = {
        name: 'A Lock',
        macId: 'abcd-1234',
        ownerId: 1,
        addUser: lockAddUserStub
      };
      const req = {
        lock,
        jwtUser: { id: 1 },
        params: { phone_number: '5555555' }
      };
      const user = {
        id: 3,
        username: 'Johnny',
        phoneNumber: '5555555'
      };
      this.userFindOneStub.resolves(user);
      lockAddUserStub.resolves(lock);

      this.func(req, this.res, this.nextSpy);

      expect(this.userFindOneStub).to.be.called;
      expect(lockAddUserStub).to.be.calledWith(user);
      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });
});