const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema(
	{
		userAddress: {
			type: String,
			required: true,
		},
		groupAddress: {
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
	groupAddress
) {
	return this.findOneAndUpdate(
		{
			userAddress,
			groupAddress,
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
	groupAddress
) {
	return this.deleteMany({
		userAddress,
		groupAddress,
	});
};

module.exports = mongoose.model("Follow", FollowSchema);
