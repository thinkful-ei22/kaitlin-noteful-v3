'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folders');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe ('Folders Test', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(seedFolders)
      .then(() => Folder.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  }); 

  // GET ALL

  describe('GET /api/folders', function () {
    it('should return all folders', function() {
      let res;
      return chai.request(app)
        .get('/api/folders')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.least(1);
          return Folder.find()
            .then(function(data) {
              expect(res.body).to.have.length(data.length);
            });
        });
    });
    it('should return the correct folder via id', function() {
      let data;
      //call the database
      return Folder.findOne()
        .then(_data => { 
          data = _data;

          // call the API with the ID
          return chai.request(app).get(`/api/folders/${data.id}`);
        })  
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id','name', 'createdAt', 'updatedAt');

          // compare database results to API response
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should return 400 given an invalid id', function() {
      // grab the inputed id
      const invalidId = '00000000000000000000000o';

      return chai.request(app)
        .get(`/api/folders/${invalidId}`)
        .catch(error => error.response)
        .then((res) =>{
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The id is not valid');
        });
    });

    it('should return 404 for nonexistant id', function() {
      return chai.request(app).get('/api/folders/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  // POST

  describe('POST /api/folders', function() {
    it('should create and return a new item when provided valid data', function () {
      const newFolder = {
        'name': 'New Folder'
      };

      let res;
      // 1. First, call the API
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body).to.have.keys('id','name','createdAt', 'updatedAt');
          // 2. Call the Database
          return Folder.findById(res.body.id);
        })
        // 3. Then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  // PUT

  describe ('PUT, /api/notes/:id', function() {
    it('should update a note at a specific id when provided with valid data', function() {
      const updateFolder = {
        name: 'name'
      };
      return Folder.findOne()
        .then(function(folder) {
          updateFolder.id = folder.id;
          // make a req. then inspect it to make sure it reflects the data we sent
          return chai.request(app)
            .put(`/api/folders/${folder.id}`)
            .send(updateFolder);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Folder.findById(updateFolder.id);
        })
        .then(function(folder) {
          expect(folder.name).to.equal(updateFolder.name);
        });
    });
  });

  describe('DELETE /api/folders/:id', function() {
    it('should delete a note at a specific id', function() {
      let folder;

      return Folder.findOne()
        .then(function(_folder) {
          folder = _folder;
          return chai.request(app).delete(`/api/folders/${folder.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Folder.findById(folder.id);
        })
        .then(function(_folder) {
          expect(_folder).to.be.null;
        });
    });
  });

});