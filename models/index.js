const mongoose = require("mongoose");
const User = require("./user");
const Post = require("./post");
const Moderator = require("./moderator");
const Follow = require("./follow");
const TxRequest = require("./txRequests");
const path = require("path");

const connectDb = () => {
	let options = {};
	if (process.env.NODE_ENV === "production") {
		options = {
			sslValidate: true,
			sslCA: `${__dirname}/../rds-combined-ca-bundle.pem`,
		};
	}

	return mongoose.connect(process.env.DB_URI, options);
};

const models = { User, Post, Moderator, Follow };

module.exports = {
	connectDb,
	models,
};
