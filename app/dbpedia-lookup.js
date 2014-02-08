var http = require('http');

//The url we want is: 'http://lookup.dbpedia.org/api/search/KeywordSearch?QueryString=cleopatra'
var searchType = 'KeywordSearch';
var keyword = 'cleopatra';

var options = {
  host: 'lookup.dbpedia.org',
  path: '/api/search/' + searchType + '?QueryString=' + keyword,
  headers: { 'accept': 'application/json' }
};

console.log(options);

http.get(options, function(res) {
  console.log("Got response: " + res.statusCode);
  console.log(res);
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
