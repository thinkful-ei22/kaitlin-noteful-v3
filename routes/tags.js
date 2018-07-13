'use strict';

// REQUIRES
const express = require('express');
const mongoose = require('mongoose');
// const mongo = require('mongodb');
// const { MONGODB_URI } = require('../config');
const Tag = require('../models/tags');
const Note = require('../models/note');
const tagsRouter = express.Router();

// GET all /tags
tagsRouter.get('/', (req, res, next) => {
  // sort the response by name
  return  Tag.find().collation({locale:'en'}).sort({name: 1})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// GET /tags by id
tagsRouter.get('/:id', (req, res, next) => {
  const searchId = req.params.id;
  // validate that it is a Mongo Object
  if(!mongoose.Types.ObjectId.isValid(searchId)) 
  {
    const err = new Error('The tag id is not valid'); 
    err.status = 400; 
    return next(err); 
  }
  return Tag.findById(searchId)
    .then(results => {
      // check the result and return a 200 response
      if (results) {
        res.json(results).status(200);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// POST /tags to create a new tag
tagsRouter.post('/', (req, res, next) => {
  const { name } = req.body;
  const newTag = {
    name: name
  };
  // add validation that protects against missing name field
  if (!newTag.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  return Tag.create(newTag)
    .then(results => {
      if (results) {
        // a successful insert returns location header & 201
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(results);
      }
    })
    // checks for duplicate error code - 11000 and response w/ helpful errror message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// PUT /tags by id to update
tagsRouter.put('/:id', (req, res, next) => {
  const tagId = req.params.id;

  const updateTag = {
    name: req.body.name
  };

  // validate against invalid ObjectId
  if(!mongoose.Types.ObjectId.isValid(tagId)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  }

  // validate against missing name field
  if(!req.body.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  return Tag.findByIdAndUpdate(tagId, {$set: updateTag}, {new: true})
    .then((results) => {
      // checks and returns 200 repsonse on the UPDATED document
      res.json(results).status(200);
    })
    // checks for duplicate error code - 11000 and response w/ helpful errror message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});


// DELETE /tags by id AND removes it from notes collection
tagsRouter.delete('/:id', (req, res, next) => {
  const tagId = req.params.id;

  return Promise.all(
    [
      // ** using $pull, remove the tags array in the notes collection
      Note.update({tags: tagId}, {$pull: {tags:tagId}}, {multi: true}),
      // remove the tag
      Tag.findByIdAndRemove(tagId)
    ])
    .then(() => {
      // add condition that checks the results and returns 204
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = tagsRouter;