var http = require('http');

var x = require("./testjson.js")
var keywords = ["war"];

generateMultipleChoiceAnswers(x, keywords);


function generateMultipleChoiceAnswers(entity, keyWordArray) {
	var firstEntity = entity.x.ArrayOfResult.Result[0];
	var categories = getCategories(firstEntity);
	var relevantCategories = findRelevantCategories(categories, keyWordArray);
	for (var i = 0; i<relevantCategories.length; i++) {

		getSubjectsOfCategory(relevantCategories[i])
	}
};

function getCategories(entity)
{
	return entity.Categories.Category;
};


function findRelevantCategories(categories, keyWordArray)
{
	var relevantCategories = [];
	console.log(categories.length)
	for (var i = 0; i < categories.length; i++) {
		var categoryIsRelevant = categoryIsRelevant(categories[i].Label, keyWordArray);
		console.log(categoryIsRelevant)
		if (categoryIsRelevant) {
			relevantCategories.push(categories[i])
		}

	}
	return relevantCategories;
};

function categoryIsRelevant(category, keyWordArray) {
	var categoryRelevant = false;
	for (var i = 0; i < keyWordArray.length; i++) {
		if (category.Label.toLowerCase().indexOf(keyWordArray[i].toLowerCase())!=-1) {
			categoryIsRelevant = true;
		}
	}
	return categoryRelevant;
};

function getSubjectsOfCategory(category) {

	//The url we want is: 'http://lookup.dbpedia.org/api/search/KeywordSearch?QueryString=cleopatra'
	var searchType = 'KeywordSearch';
	var keyword = category.Label;

	var options = {
	  host: 'dbpedia.org',
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

}
