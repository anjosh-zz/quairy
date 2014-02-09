'use strict';

angular.module('mean.flashcards').controller('FlashcardsController', ['$scope', '$routeParams', '$location', 'Global', 'Flashcards', function($scope, $routeParams, $location, Global, Flashcards) {
  $scope.global = Global;

  $scope.create = function() {
    var flashcard = new Flashcards({
      question: this.question,
      answer: this.answer
    });
    flashcard.$save(function(response) {
      $location.path('flashcards/' + response._id);
    });

    this.answer = '';
    this.content = '';
  };

  $scope.remove = function(flashcard) {
    if (flashcard) {
      flashcard.$remove();

      for(var i in $scope.flashcards) {
        if ($scope.flashcards[i] === flashcard) {
          $scope.flashcards.splice(i, 1);
        }
      }
    } else {
      $scope.flashcard.$remove();
      $location.path('flashcards');
    }
  };

  $scope.update = function() {
    var flashcard = $scope.flashcard;
    if (!flashcard.updated) {
      flashcard.updated = [];
    }
    flashcard.updated.push(new Date().getTime());

    flashcard.$update(function() {
      $location.path('flashcards/' + flashcard._id);
    });
  };

  $scope.find = function() {
    Flashcards.query(function(flashcards) {
      $scope.flashcards = flashcards;
    });
  };

  $scope.findOne = function() {
    Flashcards.get({
      flashcardId: $routeParams.flashcardId
    }, function(flashcard) {
      $scope.flashcard = flashcard;
    });
  };

}]);
