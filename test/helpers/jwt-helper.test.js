"use strict";

const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('JwtHelper', function() {

  beforeEach(function () {
    this.configMock = {
      jsonWebToken: {
        secret: 'cory',
        expiresIn: 20
      }
    };

    this.signSpy = sinon.spy();
    this.verifySpy = sinon.spy();

    this.helper = proxyquire('../../helpers/jwt-helper', {
      'jsonwebtoken': {
        sign: this.signSpy,
        verify: this.verifySpy
      },
      'config': this.configMock
    });
  });

  describe('#createJwt', function() {
    it('should call jsonwebtoken\'s sign method', function(done) {
      const obj = { id: 1 };
      this.helper.createJwt(obj);
      expect(this.signSpy).to.have.been.calledWith(
        obj,
        this.configMock.jsonWebToken.secret,
        { expiresIn: this.configMock.jsonWebToken.expiresIn }
      );
      done();
    });
  });

  describe('#verifyJwt', function() {

    it('should call jsonwebtoken\'s verify method', function(done) {
      const token = 'blahh';
      const callback = () => {};
      this.helper.verifyJwt(token, callback);
      expect(this.verifySpy).to.have.been.calledWith(
        token,
        this.configMock.jsonWebToken.secret,
        callback
      );
      done();
    });
  });
});