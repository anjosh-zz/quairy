var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('cd1fa3732c404ef0a1f1f79a2d4326bf1e356086');
alchemy.keywords('How many bytes of memory are in an integer?', {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object
  var entities = response.keywords;

  // Do something with data
  console.log(entities);
});
