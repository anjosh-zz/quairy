'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Flashcard Schema
 */
var FlashcardSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  question: String,
  answer: String,
  incorrect: Array
});

/**
 * Statics
 */
FlashcardSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};

mongoose.model('Flashcard', FlashcardSchema);
