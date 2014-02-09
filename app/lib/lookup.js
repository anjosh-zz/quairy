var http = require('http');
var SparqlClient = require('sparql-client');

var Lookup = function() {

  /* Alchemy stuff */
  var alchemyapi = require('alchemy-api');
  var alchemy = new alchemyapi('5316174d0d264239358b1423a4523a56fb7ffead');

  function getQuestionKeywords(question, cb) {
    alchemy.keywords(question, {}, function(err, response) {
      if (err) throw err;

      // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
      var keywords = response.keywords;

      results = new Array();
      for (var j = 0; j < keywords.length; j++) {
        results.push(keywords[j]['text']);
      }

      console.log(results);
      cb(results);
    });
  }

  /* HTTP Lookups */
  var options = {
    host: 'lookup.dbpedia.org',
    headers: { 'accept': 'application/json' }
  };

  function getCategories(keyword, cb) {
    options.path = '/api/search/KeywordSearch?QueryString=' + keyword;

    http.get(options, function(res) {
      var sum = '';
      res.on('data', function(chunk) {
        sum += chunk;
      });
      res.on('end', function() {
        cb(JSON.parse(sum)['results'][0]['categories']);
      });
    }).on('error', function(e) {
      throw e;
    });
  }

  /* Sparql Lookups */
  var endpoint = 'http://dbpedia.org/sparql';
  var client = new SparqlClient(endpoint);

  function findRelevantCategories(categories, keywords, cb) {
    var relevantCategoryURIs = [];

    for (var i = 0; i < categories.length; i++) {
      var current = categories[i]['label'].toLowerCase();
      for (var j = 0; j < keywords.length; j++) {
        if (current.indexOf(keywords[j]) != -1)
          relevantCategoryURIs.push(categories[i]['uri']);
      }
    }

    // TODO: Check to make sure there are relevant categories
    if (relevantCategoryURIs.length < 1) {
      console.log('No relevant category found.');
      for (var i = 0; i < categories.length; i++)
        relevantCategoryURIs.push(categories[i]['uri']);
    }

    cb(relevantCategoryURIs);
	}

  function recursiveQuery(categories, relatedEntities, cb) {
    if (categories.length == 0)
      cb(relatedEntities);
    else {
      var query = "SELECT * FROM <http://dbpedia.org> WHERE { ?people dcterms:subject <"
        + categories.pop() + ">} LIMIT 5";
      client.query(query).execute(function(err, results) {
        if (err) throw err;

        for (var j = 0; j < results.results.bindings.length; j++) {
          var answer = results.results.bindings[j].people.value.split('/').pop();
          if (relatedEntities.indexOf(answer)==-1) {
            relatedEntities.push(answer);
          }
        }
        recursiveQuery(categories, relatedEntities, cb);
      });
    }
  }

  function getRelatedEntities(categories, cb) {
    var relatedEntities = [];
    recursiveQuery(categories, relatedEntities, cb);
  }

  /* Returns an array with 3 incorrect choices */
  this.query = function(question, answer, cb) {
    console.log(answer);
    console.log(question);
    getQuestionKeywords(question, function(keywords) {
      getCategories(answer, function(categories) {
        findRelevantCategories(categories, keywords, function(relevantCategories) {
          getRelatedEntities(relevantCategories, function(relatedEntities) {
            cb(relatedEntities);
          });
        })
      });
    })
  }

}

module.exports = Lookup;
