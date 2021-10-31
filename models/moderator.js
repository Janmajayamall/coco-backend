const mongoose = require("mongoose");

const ModeratorSchema = new mongoose.Schema({
	address: {
		type: String,
		required: true,
	},
	tokeC: {
		type: String,
		required: true,
	},
	isActive: {
		type: Boolean,
		required: true,
	},
	feeNumerator: {
		type: Number,
		required: true,
	},
	feeDenominator: { type: Number, required: true },
	donEscalationLimit: { type: Number, required: true },
	expireBufferBlocks: { type: Number, required: true },
	donBufferBlocks: { type: Number, required: true },
	resolutionBufferBlocks: { type: Number, required: true },
	name: {
		type: String,
	},
});

ModeratorSchema.statics.findAll = function () {
	return this.find({});
};

ModeratorSchema.statics.findOneByAddress = function (address) {
	return this.findOne({
		address: address,
	});
};

ModeratorSchema.statics.findModeratorAndUpdate = function (filter, updates) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

const Moderator = mongoose.model("Moderator", ModeratorSchema);

module.exports = Moderator;
