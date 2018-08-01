'use strict';

const databaseConfig = require('./databaseConfig');

function getCNPWords(start, end) {

	//storing all the words in here temporarily.
	let wordArray = [];

	//returning the promise result with all the words in it.
	return databaseConfig.CNPModel.findAll({
		where: {
			CNP: {
				$gte: start,
				$lte: end,
			}
		}

	}).then((words) => {

		//looping through all the words in the range start to end and putting them
		//in the wordArray array.
		words.forEach((word) => {
			console.log(`Word found: ${word.dataValues.NAME}`);	
			wordArray.push(word.dataValues.NAME);
		});
	
	}).then(() => {
		return wordArray;

	}).catch((e) => {
		console.log('[Function getCNPWords] ' + e);
	});
}


//inserting values to the CNP Table.
function insertCNP(word) {

	return databaseConfig.CNPModel.findOne({
		where: {
			name: word
		}
	}).then((data) => {

		// console.log(data.dataValues.CNP);

		if (data) {

			return data.dataValues.CNP;

		} else {


			//This would create a new row in the table if the word
			//doesn't exist already.
			return databaseConfig.CNPModel.create({
				NAME: word,
				ISACTIVE: 1,
				CPOS: "N",
			}).then(function(rval) {
				return rval.CNP;
			});
		}

	}).catch((err) => {
		console.log(err);
	})
}

//Inserting values to the PHR table.
function insertPHR(wordData) {

	//As each relation in the PHR table is new, I didn't bother to check
	//if it already existed or not. If you need me to check that too, let me know.

	//TODO!! ^^^^^

	databaseConfig.PHRModel.create({

		CNP1: wordData.start,
		CNP2: wordData.end,
		REL: wordData.rel,
		ISACTIVE: 1,
		FIRST: wordData.newWord,
		TEXT: wordData.surfaceText
	});

}


//Checking the existing relation in the table and passing the REL number
//and creating a new REL Row if the relation doesn't exist.
function insertREL(rel) {

	return databaseConfig.RELModel.findOne({
		where: {
			name: rel
		}
	}).then((data) => {

		// console.log(data.dataValues.CNP);

		if (data) {

			return data.dataValues.REL;

		} else {

			return databaseConfig.RELModel.create({
				NAME: rel,
				TEXT: rel,
				ISACTIVE: 1
			}).then(function(rval) {
				return rval.REL;
			});
		}

	}).catch((err) => {
		console.log(err);
	})

}

module.exports = {

	getCNPWords,
	insertCNP,
	insertPHR,
	insertREL
};
