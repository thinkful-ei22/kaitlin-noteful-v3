// Create a /test/tags.js file, the basic structure in similar to /test/folders.js. Update the require statements and the Mocha life-cycle hooks to use Tag models and tags seed data.

//Create tests to verify the functionality of the /tags endpoints. As your work through the tests, check the code coverage for clues on which aspects of your code you have validated and which still needs tests.

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tags');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);

describe ('Tags Test', function() {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Tag.insertMany(seedTags)
      .then(() => Tag.createIndexes());
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  // GET ENDPOINTS

  describe('GET, /api/tags', function () {
    it('should return all tags', function () {
      let res;
      return chai.request(app)
        .get('/api/tags')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.least(1);
          return Tag.find()
            .then(function(data) {
              expect(res.body).to.have.length(data.length);
            });
        });
    });
    it('should return the correct tag via id', function () {
      let data;
      return Tag.findOne() 
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then( res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('name', 'createdAt', 'updatedAt', 'id');

          // compare database results to API response
          expect(res.body.name).to.equal(data.name);
          expect(res.body.id).to.equal(data.id);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should return 400 status given an invalid id', function () {
      const invalidId = 'INVALID-ID';

      return chai.request(app)
        .get(`/api/tags/${invalidId}`)
        .catch(error => error.response)
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The tag id is not valid');
        });
    });
    it('should return a 404 status given a nonexistant id', function () {
      return chai.request(app).get('/api/folders/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });
  
  // POST ENDPOINT

  describe('POST, /api/tags', function() {
    it('should create and return a new tag when provided valid data', function () {
      const newTag = { 'name' : 'New Tag' };
      let res;
      // call the API
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body).to.have.keys('id','name','createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
        });
    });
    it('should return a 400 error for no name in request', function () {
      const badTag = { 'title': 'New Tag' };
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(badTag)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
        });
    });
  });

  // PUT ENDPOINT

  describe('PUT, /api/tags/:id', function () {
    it('should update a tag at a specific id when provided with valid data', function() {
      const updateTag = {
        name: 'name'
      };
      return Tag.findOne()
        .then(function (tag) {
          updateTag.id = tag.id;
          return chai.request(app)
            .put(`/api/tags/${tag.id}`)
            .send(updateTag);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Tag.findById(updateTag.id);
        })
        .then(function(tag) {
          expect(tag.name).to.equal(updateTag.name);
        });
    });
    it('should return a 400 error for no name in request', function () {
      const badTag = { 'title': 'New Tag' };
      let res;
      const tagId = '222222222222222222222202';
      return chai.request(app)
        .put(`/api/tags/${tagId}`)
        .send(badTag)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
        });
    });
    it('should return a 400 error for an invalid object id', function() {
      const invalId = '123-421';
      let res;
      return chai.request(app)
        .put(`/api/tags/${invalId}`)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(400);
        });
    });
  });

  // DELETE ENDPOINT

  describe('DELETE, /api/tags/:id', function () {
    it('should delete a tag at a specific id', function() {
      let tag;
      return Tag.findOne()
        .then(function(_tag) {
          tag = _tag;
          return chai.request(app).delete(`/api/tags/${tag.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Tag.findById(tag.id);
        })
        .then(function(_tag) {
          expect(_tag).to.be.null;
        });
    });
  });
});