'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');
const Folder = require('../models/folders');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe ('Notes Test', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    const noteInsertPromise = Note.insertMany(seedNotes);
    const folderInsertPromise = Folder.insertMany(seedFolders);
    return Promise.all([noteInsertPromise, folderInsertPromise]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  // GET ALL

  describe('GET /api/notes', function () {
    it('should return all notes', function() {
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.least(1);
          return Note.find()
            .then(function(data) {
              expect(res.body).to.have.length(data.length);
            });
        });
    });
    // it('should return an error if ');

    it('should return correct search results for a valid query', function() {
      let searchTerm = 'government';
      return chai
        .request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length.of.at.least(1);
          expect(res.body[0]).to.be.a('object');
        });
    });

    it('should return correct note', function () {
      let data;
      // Call the database
      return Note.findOne()
        .then(_data => {
          data = _data;

          // Call the API w/ the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id','title','content', 'createdAt', 'updatedAt', 'folderId');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);

        });
    });
    it('should return 500 given an invalid id', function() {
      // grab the inputed id
      const invalidId = '00000000000000000000000o';

      return chai.request(app)
        .get(`/api/notes/${invalidId}`)
        .catch(error => error.response)
        .then((res) =>{
          expect(res).to.have.status(500);
          expect(res.body.message).to.eq('Internal Server Error');
        });
    });

    it('should return 404 for nonexistant id', function() {
      return chai.request(app).get('/api/notes/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });


  // POST

  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

  });


  // PUT

  describe ('PUT /api/notes/:id', function() {
    it('should update a note at a specific id when provided valid data', function() {
      const updateItem = {
        title: 'Cats vs Dogs',
        content: 'Who will win?'
      };

      return Note.findOne()
        .then(function(note) {
          updateItem.id = note.id;
          //make a req. then inspect it to make sure it reflects the data we sent
          return chai.request(app)
            .put(`/api/notes/${note.id}`)
            .send(updateItem);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Note.findById(updateItem.id);
        })
        .then(function(note) {
          expect(note.title).to.equal(updateItem.title);
          expect(note.content).to.equal(updateItem.content);
        });
    });
  });

  // DELETE
  describe ('DELETE /api/notes/:id', function() {
    it('should delete a note at a specific id', function() {
   
      let note;

      return Note.findOne()
        .then(function(_note) {
          note = _note;
          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Note.findById(note.id);
        })
        .then(function(_note) {
          expect(_note).to.be.null;
        }); 
    });
  });

});
