/*
var http = require('http');

//The url we want is: 'http://lookup.dbpedia.org/api/search/KeywordSearch?QueryString=cleopatra'
var searchType = 'KeywordSearch';
var keyword = 'einstein';

var options = {
  host: 'lookup.dbpedia.org',
  path: '/api/search/' + searchType + '?QueryString=' + keyword,
  headers: { 'accept': 'application/json' }
};

console.log(options);

http.get(options, function(res) {
  var sum = '';
  console.log("Got response: " + res.statusCode);
  res.on('data', function(chunk) {
    sum += chunk;
  });
  res.on('end', function() {
    console.log(JSON.parse(sum)['results'][0]['categories']);
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
*/
var Lookup = require('./lib/lookup');
var lookup = new Lookup();

lookup.query('What founding father discovered electricity?', 'Benjamin Franklin', function(entities) {
 // console.log(entities);
});
