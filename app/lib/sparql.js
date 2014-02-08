var SparqlClient = require('sparql-client');

var Sparql = function() {

  var endpoint = 'http://dbpedia.org/sparql';
  var client = new SparqlClient(endpoint);

  var prefixes =
    "PREFIX dbpedia-owl: <http://dbpedia.org/ontology/> "+
    "PREFIX dbpprop: <http://dbpedia.org/property/> "+
    "PREFIX dbres: <http://dbpedia.org/resource/>" +
    "PREFIX dcterms: <http://purl.org/dc/terms/>" +
    "PREFIX dbpedia: <http://dbpedia.org/ontology/>"

  function findRelevantCategories(categories, keywords, cb) {
    var relevantCategories = [];

    for (var i = 0; i < categories.length; i++) {
      var current = categories[i]['label'].toLowerCase();
      for (var j = 0; j < keywords.length; j++) {
        if (current.indexOf(keywords[j]) != -1)
          relevantCategories.push(current);
      }
    }

    cb()

	}

  this.getRelatedEntities = function(categories, keywords, cb) {
  }

}

module.exports = Sparql;
