'use strict';

const request = require('request');
const databaseQuery = require('./DatabaseConfiguration/databaseQuery.js');

//base url
const baseUrl = 'http://conceptnet5.media.mit.edu/data/5.3/';

/*
	A function that will create a url for the specific word we are looking for.
*/
function createURL(word) {

	let url = baseUrl + 'c/en/' + word;
	return url;
}

/*
	This function would insert the data to the database. 
*/
function insertToDatabase(wordData) {

	/*
		This is the new word that is associated with the existing word in the
		database.
	*/
	let newWord;

	/*
		This branch basically checks if the new word is the start word or the end word in 
		the relation.
	*/
	if (wordData.newWord == 1) {

		newWord = wordData.start;

	} else {

		newWord = wordData.end;
	}


	/*
		I created a js promise that would insert the values in the CNP table
		and would return the new id / existing words id to display in the PHR 
		table.
	*/
	databaseQuery.insertCNP(newWord)
		.then((newWordId) => {

			if(wordData.newWord == 1) {

				wordData.start = newWordId;
			} else {

				wordData.end = newWordId;
			}

			databaseQuery.insertREL(wordData.rel)
				.then((relId) => {

					wordData.rel = relId;


					// console.log(`start: ${wordData.start}`);
					// console.log(`end: ${wordData.end}`);
					// console.log(`surfaceText: ${wordData.surfaceText}`);
					// console.log(`rel: ${wordData.rel}`);

					databaseQuery.insertPHR(wordData);

				});

		}).catch((err) => {

			console.log(err);
		});

}

function run(wordList) {


	/*
		I created map function where each word in the range that we select, would
		go and collect the json data from the online dictionary and then would pass that data
		to be stored in the database
	*/
	let wordJsonListCalls = wordList.map(word => {


		//calling to create a url for that word.
		let url = createURL(word.toLowerCase());


		//I know that one of the words is from the database so I decided to get the words CNP value in the 
		//beginnning. That way I don't have to do it later. The only reason I did this was cause I know that
		//because the value is in the database, i don't have to use/store it again. So i can work with 
		//the CNP value only.
		databaseQuery.insertCNP(word)
		.then((wordId) => {

			//making an HTTP request to get the data.
			request({url, json: true}, (err, res, json) => {

				//This would keep track of how many words in the dictionary i have iterated through.
				let i = 0;

				console.log(`---- Processing for: ${word} ------`);

				//json.numFound was a treasure. I basically tells how many words-pairs are there in total.
				while (i != json.numFound) {

					let start = json.edges[i].start.split('/')[3];
					let end = json.edges[i].end.split('/')[3];
					let surfaceText = json.edges[i].surfaceText;
					let rel = json.edges[i].rel.split('/')[2];

					if (json.edges[i].start.split('/')[2] === 'en'
						&& surfaceText != null) {

						//I decided to create a dictionary to keep all the data
						//i need to store in the database in one place.
						let wordData = {};	

						wordData.start = start;
						wordData.end = end;
						wordData.rel = rel;
						wordData.surfaceText = surfaceText;

						if (word.toLowerCase() == start.toLowerCase()) {

							wordData.start = wordId;
							wordData.newWord = 2;

						} else {
							wordData.end = wordId;
							wordData.newWord = 1;
						}

						//---------CONSOLE LOGGING TO VIEW WHAT'S HAPPINGING. YOU CAN IGNORE THIS.
						// console.log(`start: ${wordData.start}`);
						// console.log(`end: ${wordData.end}`);
						// console.log(`surfaceText: ${wordData.surfaceText}`);
						// console.log(`rel: ${wordData.rel}`);

						//inserting to the database.
						insertToDatabase(wordData);
					}

					i++;

				}

				console.log(`---------------------------------`);

			});

		}).catch((err) => {
			console.log(err);
		});
	});
}


function main() {

	//taking the starting and the ending point
	let _start = process.argv[2];
	let _end = process.argv[3];

	//checking if the user has entered the starting and the ending point.
	if (_start === undefined || _end === undefined) {

		console.log('[Usage] node app.js <start> <end>');
		return;
	}

	//getting all the words from the database from _start to _end.
	databaseQuery.getCNPWords(_start, _end)
		.then((wordList) => {	
			//all the words are in the wordList array

			//here I will look up the dictionary and find more words.
			run(wordList);


		}).catch((err) => {
			console.log(`[app.js <main>] ${err}`);
		});

}

//calling the main function. Starting point
main();

