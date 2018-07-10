'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI)
  .then(() => {
    // const searchTerm = 'Lady Gaga';
    const searchTerm = /lady gaga/i;
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm };
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })    
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// FIND BY ID

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchId = '000000000000000000000004';

//     return Note.findById(searchId);
//   })
//   .then ((results) => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Create a new note with Note.create

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const newItem = { 'title': 'Are cats better than dogs?', 'content': 'Stay tuned to find out'};

//     return Note.create(newItem);
//   })
//   .then((results) => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// Update a note by id using Note.findByIdAndUpdate

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const updateItem = { 'title': 'Cats have 9 lives', 'content': 'Do you agree?'};
//     const updateItemId = '000000000000000000000002';

//     return Note.findByIdAndUpdate(updateItemId, {$set: updateItem}, {new: true});
//   })
//   .then((results) => {
//     console.log(results);
//   }).then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Delete a note by id using Note.findByIdAndRemove

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const deleteId = '000000000000000000000004';

//     return Note.findByIdAndRemove(deleteId);
//   })
//   .then((results) => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
