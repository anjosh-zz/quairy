'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.menu = [{
      'title': 'View',
      'link': 'flashcards'
    }, {
      'title': 'Create',
      'link': 'flashcards/create'
    }, {
      'title': 'Search',
      'link': 'flashcards/search'
    }];

    $scope.isCollapsed = false;
}]);
