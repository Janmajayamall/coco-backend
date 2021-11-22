const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema(
	{
		userAddress: {
			type: String,
			required: true,
		},
		moderatorAddress: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: {},
	}
);

FollowSchema.statics.findByFilter = function (filter) {
	return this.find(filter);
};

FollowSchema.statics.updateFollowRelation = function (
	userAddress,
	moderatorAddress
) {
	return this.findOneAndUpdate(
		{
			userAddress,
			moderatorAddress,
		},
		{},
		{
			new: true,
			upsert: true,
		}
	);
};

FollowSchema.statics.deleteFollowRelation = function (
	userAddress,
	moderatorAddress
) {
	return this.deleteMany({
		userAddress,
		moderatorAddress,
	});
};

module.exports = mongoose.model("Follow", FollowSchema);
