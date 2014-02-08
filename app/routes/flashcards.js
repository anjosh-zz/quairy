'use strict';

// flashcards routes use flashcards controller
var flashcards = require('../controllers/flashcards');
var authorization = require('./middlewares/authorization');

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
	if (req.flashcard.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {

  app.get('/flashcards', flashcards.all);
  app.post('/flashcards', authorization.requiresLogin, flashcards.create);
  app.get('/flashcards/:flashcardId', flashcards.show);
  app.put('/flashcards/:flashcardId', authorization.requiresLogin, hasAuthorization, flashcards.update);
  app.del('/flashcards/:flashcardId', authorization.requiresLogin, hasAuthorization, flashcards.destroy);

  // Finish with the flashcardId param
  app.param('flashcardId', flashcards.flashcard);

};
