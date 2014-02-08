var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('5316174d0d264239358b1423a4523a56fb7ffead');
alchemy.entities('Albert Einstein', {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/concept/htmlc.html for format of returned object
  var entities = response.entities;
  console.log(entities)
  // Do something with data
});