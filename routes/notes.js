'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  // mongoose.connect(MONGODB_URI)
  // .then(() => {
  const { searchTerm } = req.query;
  let filter = {};

  if (searchTerm) {
    filter.title = { $regex: searchTerm };
  }

  return Note.find(filter).sort({ updatedAt: 'desc' })
    .then(results => {
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

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  // mongoose.connect(MONGODB_URI)
  //   .then(() => {
  const searchId = req.params.id;

  return Note.findById(searchId)
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
// router.post('/', (req, res, next) => {

//   mongoose.connect(MONGODB_URI)
//     .then(() => {
//       const { title, content } = req.body;

//       const newItem = { 
//         title, 
//         content,
//       };

//       return Note.create(newItem);
//     })
//     .then((results) => {
//       res.location('path/to/new/document').status(201).json({ results });
//     })
//     .then(() => {
//       return mongoose.disconnect();
//     })
//     .catch(err => {
//       console.error(`ERROR: ${err.message}`);
//       console.error(err);
//     });
// });

router.post('/', (req, res, next) => {
  const {title, content} = req.body;
  const newNote = {
    title: title, 
    content: content, 
  };
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
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
  };
      
  const noteId = req.params.id;

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