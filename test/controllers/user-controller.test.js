"use strict";

const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

describe('UserController', function() {

  beforeEach(function () {
    this.userFindOneStub = sinon.stub().returnsPromise();
    this.createJwtStub = sinon.stub();
    this.userHasCorrectPasswordStub = sinon.stub();
    this.userBuildStub = sinon.stub();
    const mockedController = proxyquire('../../controllers/user-controller', {
      '../helpers/jwt-helper': {
        createJwt: this.createJwtStub
      },
      '../models': {
        user: {
          findOne: this.userFindOneStub,
          hasCorrectPassword: this.userHasCorrectPasswordStub,
          build: this.userBuildStub
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

  describe('#authenticateUser', function() {
    beforeEach(function() {
      this.func = this.controller.authenticateUser();
      expect(this.func).to.be.a('function');
    });

    it('should respond 404 if there is no user matching the username', function(done) {
      const req = {
        params: { username: 'Cory', password: 'password' }
      };
      this.userFindOneStub.resolves(null);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(404);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should respond 400 for wrong password', function(done) {
      const badPassword = 'password';
      const req = {
        params: { username: 'Cory', password: badPassword }
      };
      const hasCorrectPasswordStub = sinon.stub().withArgs(badPassword).returns(false);
      const user = {
        id: 1,
        username: 'Cory',
        passwordHash: 'blahblahblah',
        hasCorrectPassword: hasCorrectPasswordStub
      };
      this.userFindOneStub.resolves(user);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(400);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should respond 200 for good username and password', function(done) {
      const password = 'password';
      const req = {
        params: { username: 'Cory', password: password }
      };
      const hasCorrectPasswordStub = sinon.stub().withArgs(password).returns(true);
      const user = {
        id: 1,
        username: 'Cory',
        passwordHash: 'blahblahblah',
        hasCorrectPassword: hasCorrectPasswordStub
      };
      this.userFindOneStub.resolves(user);
      this.createJwtStub.returns('user token wooo');

      this.func(req, this.res, this.nextSpy);

      expect(this.createJwtStub).to.be.called;
      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });

  describe('#getMe', function() {
    beforeEach(function() {
      this.func = this.controller.getMe();
      expect(this.func).to.be.a('function');
    });

    it('should respond 404 if there is no user matching the id in the user\'s auth token', function(done) {
      const req = {
        jwtUser: { id: 1 }
      };
      this.userFindOneStub.resolves(null);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(404);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should respond 200 if user matching auth token is found', function(done) {
      const req = {
        jwtUser: { id: 1 }
      };
      this.userFindOneStub.resolves({ id: 1 });

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });

  describe('#createUser', function() {
    beforeEach(function() {
      this.func = this.controller.createUser();
      expect(this.func).to.be.a('function');
    });

    it('should respond 400 if user creation fails', function(done) {
      const userObj = {
        username: 'Cory',
        password: 'password',
        email: 'cory@harter.com',
        phone_number: '55555555555'
      };
      const req = {
        params: userObj
      };
      const saveStub = sinon.stub().returnsPromise().resolves(null);
      this.userBuildStub.returns(Object.assign({}, userObj, { save: saveStub }));

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(400);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should respond 201 if user is successfully created', function(done) {
      const userObj = {
        username: 'Cory',
        password: 'password',
        email: 'cory@harter.com',
        phone_number: '55555555555'
      };
      const req = {
        params: userObj
      };
      const saveStub = sinon.stub().returnsPromise().resolves(userObj);
      this.userBuildStub.returns(Object.assign({}, userObj, { save: saveStub }));

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(201);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });

  describe('#updateUser', function() {
    beforeEach(function() {
      this.func = this.controller.updateUser();
      expect(this.func).to.be.a('function');
    });

    it('should respond 404 if no user matches jwt', function(done) {
      const userObj = {
        id: 1,
        username: 'Cory'
      };
      const req = {
        jwtUser: userObj,
        params: {
          username: 'Yroc'
        }
      };
      this.userFindOneStub.resolves(null);

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(404);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should respond 400 if user update failed', function(done) {
      const userObj = {
        id: 1,
        username: 'Cory',
        password: 'password',
        email: 'cory@harter.com',
        phone_number: '55555555555'
      };
      const req = {
        jwtUser: userObj,
        params: {
          username: 'Yroc'
        }
      };
      const userUpdateStub = sinon.stub().returnsPromise().resolves(null);
      this.userFindOneStub.resolves(Object.assign({}, userObj, { update: userUpdateStub }));

      this.func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(400);
      expect(this.nextSpy).to.be.calledWith(false);
      done();
    });

    it('should respond 202 if user update succeeds', function(done) {
      const userObj = {
        id: 1,
        username: 'Cory',
        password: 'password',
        email: 'cory@harter.com',
        phone_number: '55555555555'
      };
      const req = {
        jwtUser: userObj,
        params: {
          username: 'Yroc'
        }
      };
      const userUpdateStub = sinon.stub().returnsPromise().resolves(Object.assign({}, userObj, { username: 'Yroc' }));
      this.userFindOneStub.resolves(Object.assign({}, userObj, { update: userUpdateStub }));
      this.createJwtStub.returns('user token wooo');

      this.func(req, this.res, this.nextSpy);

      expect(this.createJwtStub).to.be.called;
      expect(this.resJsonSpy).to.be.calledWith(200);
      expect(this.nextSpy).to.be.called;
      done();
    });
  });
});