const mongoose = require("mongoose");

const User = require("./user");
const Post = require("./post");

const connectDb = () => {
	return mongoose.connect(process.env.MONGO_DB_URI);
};

const models = { User, Post };

module.exports = {
	connectDb,
	models,
};
