const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
	groupAddress: {
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

GroupSchema.statics.findByFilter = function (filter) {
	return this.find(filter);
};

GroupSchema.statics.findGroupAndUpdate = function (filter, updates) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

GroupSchema.statics.checkNameUniqueness = async function (
	name,
	forGroupAddress
) {
	const _check = await this.find({
		nameUniqueness: name.trim().toLowerCase(),
	});
	let unique = true;
	if (
		_check.length != 0 &&
		(_check.length != 1 ||
			_check[0].groupAddress != forGroupAddress.toLowerCase())
	) {
		unique = false;
	}
	return unique;
};

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
