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
