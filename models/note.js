'use strict';

// Create a schema with a title (required) and content (string), and additional date fields to track create and update timestamps (createdAt - defaults to 'now'), (updatedAt - saves the current date when updating a field)

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String
});

// Add `createdAt` and `updatedAt` fields
noteSchema.set('timestamps', true);

noteSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Note', noteSchema);