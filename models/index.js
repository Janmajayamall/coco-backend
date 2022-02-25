const mongoose = require("mongoose");
const User = require("./user");
const Post = require("./post");
const Group = require("./group");
const Follow = require("./follow");
const path = require("path");

const connectDb = () => {
	let options = {};
	if (process.env.NODE_ENV === "production") {
		options = {
			ssl:true,
			sslValidate:true,
			sslCA: `${__dirname}/rds-combined-ca-bundle.pem`,
			replicaSet:"rs0",
			readPreference:"secondaryPreferred",
			retryWrites:false
		};
	}
	return mongoose.connect(process.env.DB_URI, options);
};

const models = { User, Post, Group, Follow };

module.exports = {
	connectDb,
	models,
};
