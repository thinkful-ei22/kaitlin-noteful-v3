// create a tags schema

'use strict';

const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } 
});

// add `createdAt` and `updatedAt`
tagsSchema.set('timestamps', true);

// include virtuals, suppress __v, delete _id
tagsSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (document, ret) => {
    ret.id = ret._id;
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Tag', tagsSchema);