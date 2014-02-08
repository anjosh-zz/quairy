'use strict';

/**
 * Library dependencies.
 */
var Lookup = require('../lib/lookup'),
    lookup = new Lookup();

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Flashcard = mongoose.model('Flashcard'),
    _ = require('lodash');


/**
 * Find flashcard by id
 */
exports.flashcard = function(req, res, next, id) {
  Flashcard.load(id, function(err, flashcard) {
    if (err) return next(err);
    if (!flashcard) return next(new Error('Failed to load flashcard ' + id));
    req.flashcard = flashcard;
    next();
  });
};

/**
 * Create a flashcard
 */
exports.create = function(req, res) {
  var flashcard = new Flashcard(req.body);
  flashcard.user = req.user;

  lookup.query(flashcard.question, flashcard.answer, function(incorrect) {
    flashcard.incorrect = incorrect;
    console.log(flashcard);
    flashcard.save(function(err) {
      if (err) {
        return res.send('users/signup', {
          errors: err.errors,
          flashcard: flashcard
        });
      } else {
        res.jsonp(flashcard);
      }
    });
  });
};

/**
 * Update a flashcard
 */
exports.update = function(req, res) {
  var flashcard = req.flashcard;

  flashcard = _.extend(flashcard, req.body);

  flashcard.save(function(err) {
    if (err) {
      return res.send('users/signup', {
        errors: err.errors,
        flashcard: flashcard
      });
    } else {
      res.jsonp(flashcard);
    }
  });
};

/**
 * Reroll the answers
 */
exports.reroll = function(req, res) {
  var flashcard = req.flashcard;

  lookup.query(flashcard.question, flashcard.answer, function(incorrect) {
    flashcard.incorrect = incorrect;
    console.log(flashcard);
    flashcard.save(function(err) {
      if (err) {
        return res.send('users/signup', {
          errors: err.errors,
          flashcard: flashcard
        });
      } else {
        res.jsonp(flashcard);
      }
    });
  });
};

/**
 * Delete a flashcard
 */
exports.destroy = function(req, res) {
  var flashcard = req.flashcard;

  flashcard.remove(function(err) {
    if (err) {
      return res.send('users/signup', {
        errors: err.errors,
        flashcard: flashcard
      });
    } else {
      res.jsonp(flashcard);
    }
  });
};

/**
 * Show a flashcard
 */
exports.show = function(req, res) {
  res.jsonp(req.flashcard);
};

/**
 * List of Flashcards
 */
exports.all = function(req, res) {
  Flashcard.find().sort('-created').populate('user', 'name username').exec(function(err, flashcards) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(flashcards);
    }
  });
};
