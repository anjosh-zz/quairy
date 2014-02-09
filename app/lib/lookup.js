var http = require('http');
var SparqlClient = require('sparql-client');

var realAnswer;

var Lookup = function() {

  /* Alchemy stuff */
  var alchemyapi = require('alchemy-api');
  var alchemy = new alchemyapi('cd1fa3732c404ef0a1f1f79a2d4326bf1e356086');

  function getKeywords(question, cb) {
    alchemy.keywords(question, {}, function(err, response) {
      if (err) throw err;

      // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
      var keywords = response.keywords;

      results = new Array();
      for (var j = 0; j < keywords.length; j++) {
        results.push(keywords[j]['text']);
      }

      cb(results);
    });
  }

  /* HTTP Lookups */
  var options = {
    host: 'lookup.dbpedia.org',
    headers: { 'accept': 'application/json' }
  };

  function getCategories(keyword, cb) {
    while (keyword.indexOf(' ') !== -1) {
      keyword = keyword.replace(' ','+');
    }
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

  function getDescription(entity, cb) {
     options.path = '/api/search/KeywordSearch?QueryString=' + entity;

    http.get(options, function(res) {
      var sum = '';
      res.on('data', function(chunk) {
        sum += chunk;
      });
      res.on('end', function() {
        var ret;
        if (JSON.parse(sum)['results'].length > 0 ) {
            ret = JSON.parse(sum)['results'][0]['description'];
      } 
        else {
          ret = null;
        }
        cb(ret);      
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
      var query = "SELECT * FROM <http://dbpedia.org> WHERE { ?resource dcterms:subject <"
        + categories.pop() + ">} LIMIT 5";
      client.query(query).execute(function(err, results) {
        if (err) throw err;

        for (var j = 0; j < results.results.bindings.length; j++) {
          var answer = results.results.bindings[j].resource.value.split('/').pop();

          if (answer.indexOf('%') === -1) {
            var parIndex = answer.indexOf('(');
            if (parIndex !== -1) {
                answer = answer.slice(0, parIndex - 1);
            }
            while (answer.indexOf('_') !== -1) {
              answer = answer.replace('_',' ');
            }
            if (relatedEntities.indexOf(answer) === -1 && answer !== realAnswer) {
              relatedEntities.push(answer);
            }
          }
        }
        recursiveQuery(categories, relatedEntities, cb);
      });
    }
  }

  function getWrongAnswerDescription(wrongAnswer, cb) {
    var description;
    var wrongAnswerKeyWords = []
    getDescription(wrongAnswer, function(description) {
    cb(description);
    })
  }

  function rankEntities(relatedWrongAnswers, answer, i, cb) {
      var answerDescription;
      var answerKeywords = [];
      getDescription(answer, function(answerDescription){
        getKeywords(answerDescription, function(answerKeywords) {
          for (var key = 0; key < answerKeywords.length; key++) answerKeywords[key].split(' ');
            compareRightAnswerKeywordsToWrongAnswerDescriptions(answerKeywords, relatedWrongAnswers, 0, cb);
        }) // get keywords
      }) // get desc
    
  }

function compareRightAnswerKeywordsToWrongAnswerDescriptions(answerKeywords, relatedWrongAnswers, i, cb) {
  if (i >= relatedWrongAnswers.length - 1) {
    cb(relatedWrongAnswers)
  }
  else {
  if (answerKeywords.length > 0) {
            var wrongAnswerDescription;
            getWrongAnswerDescription(relatedWrongAnswers[i], function(wrongAnswerDescription) {
              var score = 0;
              if (wrongAnswerDescription != null) {
                wrongAnswerDescription = wrongAnswerDescription.substring(0, wrongAnswerDescription.split('.')[0]);
                for (var j = 0; j < answerKeywords.length; j++) {
                  // This would be so much better if we could use that relation 
                  // thing that Justin was looking at earlier
                  if (wrongAnswerDescription.indexOf(answerKeywords[j]) != -1) {
                    score++;
                  }
                }
              }
            relatedWrongAnswers[i].score = score;
            });
        }
    i++;
    compareRightAnswerKeywordsToWrongAnswerDescriptions(answerKeywords, relatedWrongAnswers, i, cb);
  }
}

function getRelatedEntities(categories, cb) {
    var relatedEntities = [];
    recursiveQuery(categories, relatedEntities, cb);
  }


function compareScore(a,b) {
  if (a.score < b.score)
     return -1;
  if (a.score > b.score)
    return 1;
  return 0;
}

  function getBestWrongAnswers(wrongAnswers) {
    if (wrongAnswers.length == 0) return null;
    if (wrongAnswers.length < 3) {
      return wrongAnswers;
    }
    else{
      wrongAnswers.sort(compareScore);
      //return wrongAnswers.slice(wrongAnswers.length - 3, wrongAnswers.length);
      return wrongAnswers.slice(0, 3);
    }
  }

  /* Returns an array with 3 incorrect choices */
  this.query = function(question, answer, cb) {
    realAnswer = answer;
    console.log(question);
    console.log(answer);
    if (!isNaN(answer)) {
      var result = new Array();
      while (result.length < 3) {
        possible = Math.floor(parseInt(answer) + Math.random() * 20)
        if (result.indexOf(possible) === -1 && result !== parseInt(answer) && possible < 2015) {
          result.push(possible);
        }
      }
      cb(result);
    }
    else {
      getKeywords(question, function(keywords) {
        getCategories(answer, function(categories) {
          findRelevantCategories(categories, keywords, function(relevantCategories) {
            getRelatedEntities(relevantCategories, function(relatedEntities) {
              rankEntities(relatedEntities,answer, 0, function(finalRelatedEntities) {
                cb(getBestWrongAnswers(finalRelatedEntities))
              })
            });
          })
        });
      })
    }
  }

}

module.exports = Lookup;
