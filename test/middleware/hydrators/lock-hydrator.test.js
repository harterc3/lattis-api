"use strict";

const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

describe('LockHydrator', function() {

  beforeEach(function () {
    this.lockFindOneStub = sinon.stub().returnsPromise();
    this.hydrator = proxyquire('../../../middleware/hydrators/lock-hydrator', {
      '../../models': {
        lock: {
          findOne: this.lockFindOneStub
        },
        user: {

        }
      },
      'bunyan': {
        createLogger: function(options) {
          return {};
        }
      }
    });

    this.resJsonSpy = sinon.spy();
    this.res = {
      json: this.resJsonSpy
    };

    this.nextSpy = sinon.spy();

    this.lockIdParamName = 'id';
  });

  describe('#hydrate', function() {
    it('should return a function', function(done) {
      const result = this.hydrator.hydrate(this.lockIdParamName);
      expect(result).to.be.a('asyncfunction');
      done();
    });
  });

  describe('->hydrate middleware function', function() {
    it('should give 400 response if no lock id route param is found', async function() {
      const func = this.hydrator.hydrate(this.lockIdParamName);
      const req = {
        params: {}
      };

      await func(req, this.res, this.nextSpy);

      expect(this.resJsonSpy).to.be.calledWith(400);
      expect(this.nextSpy).to.be.calledWith(false);
    });

    it('should query for lock with id value', async function() {
      const func = this.hydrator.hydrate(this.lockIdParamName);
      const req = {
        params: {}
      };
      req.params[this.lockIdParamName] = '2';
      const lockObj = {id: '2', name: 'lockk'};
      this.lockFindOneStub.resolves(lockObj);

      await func(req, this.res, this.nextSpy);

      expect(req.lock).to.equal(lockObj);
      expect(this.nextSpy).to.be.called;
    });
  });
});