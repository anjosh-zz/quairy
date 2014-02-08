'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/flashcards', {
          templateUrl: 'views/flashcards/list.html'
        }).
        when('/flashcards/create', {
          templateUrl: 'views/flashcards/create.html'
        }).
        when('/flashcards/:flashcardId/edit', {
          templateUrl: 'views/flashcards/edit.html'
        }).
        when('/flashcards/search', {
          templateUrl: 'views/flashcards/search.html'
        }).
        when('/flashcards/:flashcardId', {
          templateUrl: 'views/flashcards/view.html'
        }).
        when('/articles', {
            templateUrl: 'views/articles/list.html'
        }).
        when('/articles/create', {
            templateUrl: 'views/articles/create.html'
        }).
        when('/articles/:articleId/edit', {
            templateUrl: 'views/articles/edit.html'
        }).
        when('/articles/:articleId', {
            templateUrl: 'views/articles/view.html'
        }).
        when('/', {
            templateUrl: 'views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);
