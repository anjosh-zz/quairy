var alchemyapi = require('alchemy-api');
var alchemy = new alchemyapi('5316174d0d264239358b1423a4523a56fb7ffead');

var question = 'Who was the queen of Egypt in 100 BC?';
console.log(question);

alchemy.keywords(question, {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
  var keywords = response.keywords;

  // Do something with data
  console.log('keywords:');

  results = new Array();
  for (var j = 0; j < keywords.length; j++) {
    console.log(keywords[j]['text']);
    results.push(keywords[j]['text']);
  }
});
