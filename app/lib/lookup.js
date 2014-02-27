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
        splitKeywords = keywords[j]['text'].split(' ');
        for (var k = 0; k < splitKeywords.length; k++) {
          results.push(splitKeywords[k]);
        }
      }

      cb(results);
    });
  }

  /* HTTP Lookups */
  var options = {
    host: 'lookup.dbpedia.org',
    headers: { 'accept': 'application/json' }
  };

  function dbLookup(keyword, cbType, cb) {
    while (entity.indexOf(' ') !== -1) {
       entity = entity.replace(' ','+');
    }
    options.path = '/api/search/KeywordSearch?QueryString=' + entity;

    http.get(options, function(res) {
      var sum = '';
      res.on('data', function(chunk) {
        sum += chunk;
      });
      res.on('end', function() {
        var ret;
        results = JSON.parse(sum)['results'];
        if (results.length > 0 ) {
          ret = results[0][cbType];
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

  function getCategories(keyword, cb) {
    dbLookup(keyword, 'uri', cb);
    dbLookup(keyword, 'categories', cb);
  }

  function getDescription(entity, cb) {
    dbLookup(entity, 'description', cb);
  }

  function findRelevantCategories(categories, keywords, cb) {
    console.log('#### Answer Keywords');
    console.log(keywords);
    var relevantCategoryURIs = [];

    for (var i = 0; i < categories.length; i++) {
      var category = categories[i]['label'].toLowerCase();
      for (var j = 0; j < keywords.length; j++) {
        keyword = keywords[j].toLowerCase();
        //console.log('Keyword: ' + keyword);
        //console.log('Category: ' + category);
        if (category.indexOf(keyword) != -1)
          console.log('### Relevant Category Found!! ###');
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

  /* Sparql Lookups */
  var endpoint = 'http://dbpedia.org/sparql';
  var client = new SparqlClient(endpoint);

  function recursiveQuery(categoryURIs, answerURI, relatedEntities, cb) {
    if (categoryURIs.length == 0) {
      cb(relatedEntities);
    }
    else {
      categoryURI = categoryURIs.pop();
      category = categoryURI.split('/').pop();

      // We're still limiting it to 5 entities per category and it's so slow :(
      //var query = "SELECT * FROM <http://dbpedia.org> WHERE { ?resource dcterms:subject <" + categoryURI + ">} LIMIT 5";

      //var relatedEntitiesQuery = 'SELECT ?resource ?type {  \
      //  <' + answerURI + '> a ?type .                       \
      //  filter( contains( str(?type), "ontology" ) ) .      \
      //  ?resource dcterms:subject <" + categoryURI + ">;    \
      //  a ?type } LIMIT 5';

      var relatedEntitiesQuery = 'SELECT DISTINCT ?resource { \
        <' + answerURI + '> a ?type .                         \
        filter( contains( str(?type), "ontology" ) ) .        \
        <' + answerURI + '> dcterms:subject ?subject .        \
        ?resource dcterms:subject ?subject;                   \
        rdf:type ?type } LIMIT 50';
 
      console.log(query);
      client.query(query).execute(function(err, results) {
        if (err) throw err;

        console.log(JSON.stringify(results));
        for (var j = 0; j < results.results.bindings.length; j++) {
          var answer = results.results.bindings[j].resource.value.split('/').pop();

          //console.log('### Answer in Category - ' + category + ' ###');
          //console.log('*** ' + answer + ' ***');

          // hack to get rid of characters with % in them (strange encoding)
          if (answer.indexOf('%') === -1) {
            var parIndex = answer.indexOf('(');
            if (parIndex !== -1) {
                answer = answer.slice(0, parIndex - 1);
            }
            while (answer.indexOf('_') !== -1) {
              answer = answer.replace('_',' ');
            }
            if (relatedEntities.indexOf(answer) === -1 && answer !== realAnswer) {
              //console.log('###### Added Entity! ######');
              relatedEntities.push(answer);
            }
          }
        }
        recursiveQuery(categoryURIs, answerURI, relatedEntities, cb);
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
    var relatedWrongAnswerObjs = new Array();

    getDescription(answer, function(answerDescription){
      getKeywords(answerDescription, function(answerKeywords) {
        // Don't think this line is doing anything so commenting it - Josh
        //for (var key = 0; key < answerKeywords.length; key++) answerKeywords[key].split(' ');
        console.log('$$$$ Answer Description Keywords:');
        console.log(answerKeywords);
        compareRightAnswerKeywordsToWrongAnswerDescriptions(answerKeywords, relatedWrongAnswers, relatedWrongAnswerObjs, i, cb);
      }) // get keywords
    }) // get desc

  }

  function compareRightAnswerKeywordsToWrongAnswerDescriptions(answerKeywords, relatedWrongAnswers, relatedWrongAnswerObjs, i, cb) {
    //console.log('%%%%%%% Related Wrong Answers %%%%%%%');
    //console.log(relatedWrongAnswers);

    if (i >= relatedWrongAnswers.length - 1) {
      //console.log("@@@@ Final Related Wrong Answer Objects @@@");
      //console.log(relatedWrongAnswerObjs);
      cb(relatedWrongAnswerObjs)
    }
    else {
      //if (answerKeywords.length > 0) {
        var wrongAnswerDescription;
        getWrongAnswerDescription(relatedWrongAnswers[i], function(wrongAnswerDescription) {
          var relatedWrongAnswerObj = new Object();
          var score = 0;

          if (wrongAnswerDescription != null) {
            // I don't think this is doing anything so I commented it out - Josh
            //wrongAnswerDescription = wrongAnswerDescription.substring(0, wrongAnswerDescription.split('.')[0]);
            for (var j = 0; j < answerKeywords.length; j++) {
              // This would be so much better if we could use that relation 
              // thing that Justin was looking at earlier
              if (wrongAnswerDescription.indexOf(answerKeywords[j]) !== -1) {
                score++;
              }
            }
          }
          relatedWrongAnswerObj.label = relatedWrongAnswers[i];
          relatedWrongAnswerObj.score = score;
          relatedWrongAnswerObjs.push(relatedWrongAnswerObj);
          
          //console.log(relatedWrongAnswerObj.label + ' Score: ' + relatedWrongAnswerObj.score);
          //console.log("@@@@ Related Wrong Answer Objects @@@");
          //console.log(relatedWrongAnswerObjs);

          i++;
          compareRightAnswerKeywordsToWrongAnswerDescriptions(answerKeywords, relatedWrongAnswers, relatedWrongAnswerObjs, i, cb);
        });
      //}
    }
  }

  function getRelatedEntities(categoryURIs, answerURI, cb) {
    var relatedEntities = new Array();
    recursiveQuery(categoryURIs, answerURI, relatedEntities, cb);
  }


  function compareScore(a,b) {
    if (a.score < b.score)
       return -1;
    if (a.score > b.score)
      return 1;
    return 0;
  }

  function getBestWrongAnswers(wrongAnswers) {
    console.log("Finding Best Answers");
    console.log("Numbers of Answers: " + wrongAnswers.length);
    if (wrongAnswers.length === 0) return null;
    // wrongAnswers is an Array of Objects, we need to return an array of strings instead
    wrongAnswersArray = new Array();

    if (wrongAnswers.length < 3) {
      for (var i = 0; i < 3; i++) {
        wrongAnswersArray.push(wrongAnswers.pop().label);
      }
      return wrongAnswersArray;
    }
    else {
      console.log("Sorting");
      wrongAnswers.sort(compareScore);
      //return wrongAnswers.slice(wrongAnswers.length - 3, wrongAnswers.length);
      //console.log("////// Sorted Wrong Answers //////");
      //console.log(wrongAnswers);

      // only need to return top three results
      wrongAnswers = wrongAnswers.slice(wrongAnswers.length - 3, wrongAnswers.length);
      //console.log("////// Wrong Answers temp //////");
      //console.log(wrongAnswers);

      // put labels of results into an array for returning back
      for (var i = 0; i < wrongAnswers.length; i++) {
        wrongAnswersArray.push(wrongAnswers[i].label);
      }

      console.log("////// Wrong Answers To be returned //////");
      console.log(wrongAnswersArray);
      return wrongAnswersArray;
    }
  }

  /* Returns an array with 3 incorrect choices */
  this.query = function(question, answer, cb) {
    console.log(question);
    console.log(answer);

    // bad global variable
    realAnswer = answer;

    answerObj = new Object();
    answerObj.uri = '';
    answerObj.label = answer;

    if (!isNaN(answer.label)) {
      var result = new Array();
      while (result.length < 3) {
        possible = Math.floor(parseInt(answer.label) + Math.random() * 20)
        if (result.indexOf(possible) === -1 && result !== parseInt(answer.label) && possible < 2015) {
          result.push(possible);
        }
      }
      cb(result);
    }
    else {
      getKeywords(question, function(keywords) {
        getCategories(answerObj.label, function(categories) {
          findRelevantCategories(categories, keywords, function(relevantCategories) {
            getRelatedEntities(relevantCategories, answerObj.uri, function(relatedEntities) {
              // we will get back finalRealtedEntities as an Array of Objects not Array of Strings
              rankEntities(relatedEntities, answerObj.label, 0, function(finalRelatedEntities) {
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
