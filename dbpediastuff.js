var SparqlClient = require('sparql-client')
var util = require('util')
var endpoint = 'http://dbpedia.org/sparql';

var prefixes = 
"PREFIX dbpedia-owl: <http://dbpedia.org/ontology/> "+
"PREFIX dbpprop: <http://dbpedia.org/property/> "+
"PREFIX dbres: <http://dbpedia.org/resource/>" +
"PREFIX dcterms: <http://purl.org/dc/terms/>" +
"PREFIX dbpedia: <http://dbpedia.org/ontology/>"

// This is the incoming entity that comes from the answer
var entity = "Cleopatra";
var questionSubjects = ["Egypt", "Pharaoh"];

var client = new SparqlClient(endpoint);

// Make sure everything is uppercase

// Check if the url is a valid webpage
 getRelatedEntitiesOfSameSubject(entity);

function getRelatedEntitiesOfSameSubject(entity) {

var entityURL = "http://dbpedia.org/resource/" + entity;
var query = prefixes + "SELECT * FROM <http://dbpedia.org> WHERE { ?person dcterms:subject ?subject } LIMIT 10";
console.log("Query to " + endpoint);
console.log("Query: " + query);
client.query(query)
.bind('person', "<" + entityURL + ">")
.execute(findEntitiesRelatedToSubject);

}

function findEntitiesRelatedToSubject(error, results) {
//process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");
	//console.log(results.results.bindings[0].subject.value)
	var especiallyRelevantSubjectURIs = [];
	var allSubjectURIs = [];


	for (i = 0; i < results.results.bindings.length; i++) {
		
		var subjectURI = results.results.bindings[i].subject.value;
		// Checks for question keywords in the subjects
		for (var subject = 0; subject < questionSubjects.length; subject++)
		{
			
			if (subjectURI.split(":").pop().toLowerCase().indexOf(questionSubjects[subject].toLowerCase()) != -1)
			{
				if (especiallyRelevantSubjectURIs.indexOf(subjectURI) == -1) {
					especiallyRelevantSubjectURIs.push(subjectURI);
				}
			}
		}
		if (allSubjectURIs.indexOf(subjectURI) == -1) {
			allSubjectURIs.push(subjectURI);
		}

	}
	for (var subject = 0; subject < especiallyRelevantSubjectURIs.length; subject++) {

		// This is the fallback method
		console.log(especiallyRelevantSubjectURIs[subject])
		getEntitiesForSubjectURL(especiallyRelevantSubjectURIs[subject]);
	}
}



function getEntitiesForSubjectURL(subjectURL) {

	var potentialAnswers = []
	var query = prefixes + 
		"SELECT * FROM <http://dbpedia.org> WHERE { ?people dcterms:subject <" 
		+ subjectURL + ">} LIMIT 10";
		client.query(query)
		  	.execute(function(error, results) {
		  		for (var i = 0; i < results.results.bindings.length; i++) {
		  			var answer = results.results.bindings[i].people.value.split('/').pop();
		  			if (potentialAnswers.indexOf(answer)==-1) {
		  					potentialAnswers.push(answer);
		  				}
		  	}
		  	for (var i = 0; i<potentialAnswers.length; i++) {
		  		console.log(potentialAnswers[i])
		  	}
			});
}