var http = require('http');

//The url we want is: 'http://lookup.dbpedia.org/api/search/KeywordSearch?QueryString=cleopatra'
var searchType = 'KeywordSearch';
var keyword = 'cleopatra';

var options = {
  host: 'http://lookup.dbpedia.org',
  path: '/api/search/' + searchType + '?QueryString=' + keyword,
  headers: { Accept: 'application/json' }
};

console.log(options);

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}

http.request(options, callback).end();
