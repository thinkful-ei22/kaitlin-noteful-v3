// Create a simple schema with a title (required & unique)

'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true}
});

// Add `createdAt` and `updatedAt` fields
folderSchema.set('timestamps', true);

folderSchema.set('toObject' ,{
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Folder', folderSchema);