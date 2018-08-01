'use strict';

const Sequelize = require('sequelize');

/*
	initilizes a new sequelize object which connects to the 
	RR database and the username is sa and the password is arnav@1996.
	I have set the logging to false so it won't flood the terminal
	with all the useless query data.
*/
var sequelize = new Sequelize('RR', 'sa', 'arnav@1996', {
	host: 'localhost',
	dialect: 'mssql',
	port: 1443,
	dialectOptions: {
		instanceName: 'SQLEXPRESS'
	},
	logging: false
});

/*
	Below are all the databases models which will link to the database. 
	These are basically all the tables that are part the database.
*/
const CNPModel = sequelize.import(__dirname + '\\DatabaseModels\\CNP_Model.js');
const PHRModel = sequelize.import(__dirname + '\\DatabaseModels\\PHR_Model.js');
const RELModel = sequelize.import(__dirname + '\\DatabaseModels\\REL_Model.js');

module.exports = {

	CNPModel,
	PHRModel,
	RELModel
}
