const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
	},
	coldAddress: {
		type: String,
		unique: true,
		required: true,
	},
	hotAddress: {
		type: String,
		unique: true,
		required: true,
	},
});

UserSchema.statics.findUserByColdAddress = function (address) {
	return this.findOne({ coldAddress: address });
};

UserSchema.statics.findUserAndUpdate = function (filter, updates) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
