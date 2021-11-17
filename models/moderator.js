const mongoose = require("mongoose");

const ModeratorSchema = new mongoose.Schema({
	oracleAddress: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
});

ModeratorSchema.statics.findByFilter = function (filter) {
	return this.find(filter);
};

ModeratorSchema.statics.findModeratorAndUpdate = function (filter, updates) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

const Moderator = mongoose.model("Moderator", ModeratorSchema);

module.exports = Moderator;
