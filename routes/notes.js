'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  const { searchTerm, folderId, tagId } = req.query;
  let filter = {};

  if (searchTerm) {
    filter.title = { $regex: searchTerm };
  }

  if (folderId) {
    filter.folderId = folderId ;
  }

  if (tagId) {
    filter.tags = tagId ;
  }

  return Note.find(filter).populate('tags').sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  // mongoose.connect(MONGODB_URI)
  //   .then(() => {
  const searchId = req.params.id;
  if (!(mongoose.Types.ObjectId.isValid(searchId))) {
    return next('error');
  }
  
  return Note.findById(searchId).populate('tags')
    .then (results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    // .then(() => {
    //   return mongoose.disconnect();
    // })
    .catch(err => {
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */

router.post('/', (req, res, next) => {
  const {title, content, folderId, tags} = req.body;
  const newNote = {
    title: title, 
    content: content, 
    folderId: folderId,
    tags
  };
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (newNote.folderId) {
    if(!mongoose.Types.ObjectId.isValid(newNote.folderId)) 
    { 
      const err = new Error('The id is not valid'); 
      err.status = 400; return next(err); 
    }
  }
  // loop through array of tags to validated
  if(newNote.tags.length > 0) {
    if(newNote.tags.find( tagId => {
      return !mongoose.Types.ObjectId.isValid(tagId);
    })){
      const err = new Error('The tag id is not valid'); 
      err.status = 400; 
      return next(err); 
    }
  }

  return Note.create(newNote)
    .then(results => {
      if (results){
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  // mongoose.connect(MONGODB_URI)
  //   .then(() => {
      
  const updateItem = {
    title: req.body.title,
    content: req.body.content,
    folderId: req.body.folderId,
    tags: req.body.tags
  };
      
  const noteId = req.params.id;

  if (updateItem.folderId) {
    if(!mongoose.Types.ObjectId.isValid(updateItem.folderId)) 
    { 
      const err = new Error('The id is not valid'); 
      err.status = 400; 
      return next(err); 
    }
  }

  if (updateItem.tags) {
    console.log(updateItem.tags);
    updateItem.tags.forEach((tag) => { 
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The tag id is not valid'); 
        err.status = 400; 
        return next(err); 
      }
    });
  }

  return Note.findByIdAndUpdate(noteId, {$set: updateItem}, {new: true})
    .then((results) => {
      res.json(results);
    })
    // .then(() => {
    //   return mongoose.disconnect();
    // })
    .catch(err => {
      next(err);
      // console.error(`ERROR: ${err.message}`);
      // console.error(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  // mongoose.connect(MONGODB_URI)
  //   .then(() => {
  const deleteId = req.params.id;

  return Note.findByIdAndRemove(deleteId)
    .then(() => {
      res.status(204).end();
    })
    // .then(() => {
    //   return mongoose.disconnect();
    // })
    .catch(err => {
      next(err);
      // console.error(`ERROR: ${err.message}`);
      // console.error(err);
    });

  // console.log('Delete a Note');
  // res.status(204).end();
});

module.exports = router;