"use strict";

const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('Authenticator', function() {

  beforeEach(function () {
    this.verifySpy = sinon.spy();

    this.authenticator = proxyquire('../../middleware/authenticator', {
      '../helpers/jwt-helper': {
        verifyJwt: this.verifySpy
      }
    });

    this.resJsonSpy = sinon.spy();
    this.res = {
      json: this.resJsonSpy
    };

    this.nextSpy = sinon.spy();
  });

  describe('#verifyUser', function() {
    it('should send 403 response if request has no x-access-token header', function(done) {
      const req = {
        params: {},
        headers: {
          something: 'hi'
        }
      };
      this.authenticator.verifyUser(req, this.res, this.nextSpy);
      expect(this.resJsonSpy).to.have.been.calledWith(403);
      expect(this.nextSpy).to.have.been.calledWith(false);
      done();
    });

    it('should call JwtHelper\'s verify function if request has x-access-token header', function(done) {
      const token = 'token';
      const req = {
        params: {},
        headers: {
          'x-access-token': token
        }
      };
      this.authenticator.verifyUser(req, this.res, this.nextSpy);
      expect(this.verifySpy).to.have.been.calledWith(token);
      done();
    });
  });
});