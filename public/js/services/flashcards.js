'use strict';

// Flashcards service used for flashcards REST endpoint
angular.module('mean.flashcards').factory('Flashcards', ['$resource', function($resource) {
  return $resource('flashcards/:flashcardId', {
    flashcardId: '@_id'
  }, {
    update: {
      method: 'PUT'
    }
  });
}]);
