'use strict';

// REQUIRES
const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folders');

const foldersRouter = express.Router();

// GET ALL /folders 
foldersRouter.get('/', (req, res, next) =>{
  // SORT BY NAME
  return Folder.find().collation({locale:'en'}).sort({name: 1})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// GET /folders BY ID
foldersRouter.get('/:id', (req, res, next) => {
  const searchId = req.params.id;
  // Validate the id is a Mongo ObjectId
  if(!mongoose.Types.ObjectId.isValid(searchId)) 
  { 
    const err = new Error('The id is not valid'); 
    err.status = 400; 
    return next(err); 
  }
  // Conditionally return a 200 response OR a 404 not found
  return Folder.findById(searchId)
    .then (results => {
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

// POST /folders TO CREATE A NEW FOLDER
foldersRouter.post('/', (req, res, next) => {
  const { name }  = req.body;
  const newFolder = {
    name: name
  };
  // Validate the incoming body has a name field
  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  return Folder.create(newFolder)
    .then(results => {
      if (results) {
        // Respond with a 201 status and a location header
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(results);
      }
    })
    // Catch duplicate key error code 11000 and respond with a helpful error message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// PUT /folders BY ID TO UPDATE A FOLDER NAME
foldersRouter.put('/:id', (req, res, next) => {
  const folderId = req.params.id;

  const updateFolder = {
    name: req.body.name
  };

  // Validate the id is a Mongo ObjectId
  if(!mongoose.Types.ObjectId.isValid(folderId)) 
  { 
    const err = new Error('The id is not valid'); 
    err.status = 400; return next(err); 
  }
  // Validate the incoming body has a name field
  if(!req.body.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  return Folder.findByIdAndUpdate(folderId, {$set: updateFolder}, {new: true})
    .then((results) => {
      res.json(results);
    })
    // Catch duplicate key error code 11000 and respond with a helpful error message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// DELETE /folder BY ID WHICH DELETES THE FOLDER AND THE RELATED NOTES
foldersRouter.delete('/:id', (req, res, next) => {
  const folderId = req.params.id;

  return Folder.findByIdAndRemove(folderId)
    .then(() => {
      // Respond with a 204 status
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = foldersRouter;