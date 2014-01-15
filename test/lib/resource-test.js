"use strict";

var app = require('../../lib/app');

var nock = require('nock');

var sendRequest = function(context, opts, done) {
  var req = request(app).get('/resource');

  if (opts.accessToken) {
    var tokenType = opts.tokenType || 'Bearer';

    req.set('Authorization', tokenType + ' ' + opts.accessToken);
  }

  req.end(function(err, res) {
    context.res = res;
    done(err);
  });
};

var verifyError = function(res, error) {
  expect(res.headers['content-type']).to.equal('application/json; charset=utf-8');
  expect(res.body).to.be.an('object');
  expect(res.body).to.have.property('error');
  expect(res.body.error).to.equal(error);
};

describe("Accessing a protected resource", function() {
  context("with a valid access token", function() {
    before(function(done) {
      var config = app.get('config');

      nock(config.uris.authorization_uri)
        .post('/authorized')
        .reply(200);

      sendRequest(this, { accessToken: '123abc' }, done);
    });

    it("should return status 200", function() {
      expect(this.res.statusCode).to.equal(200);
    });

    it("should return the protected resource", function() {
      expect(this.res.text).to.equal('Hello world!');
    });
  });

  context("with no authorization header", function() {
    before(function(done) {
      sendRequest(this, { accessToken: null }, done);
    });

    it("should return status 400", function() {
      expect(this.res.statusCode).to.equal(400);
    });

    it("should return an invalid_request error", function() {
      verifyError(this.res, 'invalid_request');
    });
  });

  context("with an invalid access token", function() {
    before(function(done) {
      var config = app.get('config');

      nock(config.uris.authorization_uri)
        .post('/authorized')
        .reply(401);

      sendRequest(this, { accessToken: 'abc123' }, done);
    });

    it("should return status 401", function() {
      expect(this.res.statusCode).to.equal(401);
    });

    it("should return an unauthorized error", function() {
      verifyError(this.res, 'unauthorized');
    });
  });

  context("with an incorrect token type", function() {
    before(function(done) {
      sendRequest(this, { accessToken: 'abc123', tokenType: 'Basic' }, done);
    });

    it("should return status 400", function() {
      expect(this.res.statusCode).to.equal(400);
    });

    it("should return an invalid_request error", function() {
      verifyError(this.res, 'invalid_request');
    });
  });

  context("when the authorization server fails", function() {
    before(function(done) {
      var config = app.get('config');

      nock(config.uris.authorization_uri)
        .post('/authorized')
        .reply(500);

      sendRequest(this, { accessToken: 'abc123' }, done);
    });

    it("should return status 500", function() {
      expect(this.res.statusCode).to.equal(500);
    });
  });
});
