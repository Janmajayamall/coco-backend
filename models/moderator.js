const mongoose = require("mongoose");

const ModeratorSchema = new mongoose.Schema({
	oracleAddress: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
	description: {
		type: String,
	},
	nameUniqueness: {
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

ModeratorSchema.statics.checkNameUniqueness = async function (
	name,
	forOracleAddress
) {
	const _check = await this.find({
		nameUniqueness: name.trim().toLowerCase(),
	});
	let unique = _check.length === 0;
	_check.forEach(function (obj) {
		// whenever name uniqueness is checked for moderator that already has that name,
		// return unique = true
		if (obj.oracleAddress === forOracleAddress.toLowerCase()) {
			unique = true;
		}
	});
	return unique;
};

const Moderator = mongoose.model("Moderator", ModeratorSchema);

module.exports = Moderator;
