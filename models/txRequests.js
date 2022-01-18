const mongoose = require("mongoose");

const TxRequestSchema = new mongoose.Schema(
	{
		txCalldata: {
			type: String,
			required: true,
		},
		txJsonStr: {
			type: String,
			required: true,
		},
		relayedOnChain: {
			type: Boolean,
			required: true,
		},
		signatures: {
			type: Array,
			required: true,
		},
		oracleAddress: {
			type: String,
			required: true,
		},
		status: {
			type: Boolean,
			required: true,
		},
	},
	{
		timestamps: {},
	}
);

TxRequestSchema.statics.findByFilter = function (filter) {
	return this.find(filter);
};

// TxRequestSchema.statics.updateFollowRelation = function (
// 	userAddress,
// 	moderatorAddress
// ) {
// 	return this.findOneAndUpdate(
// 		{
// 			userAddress,
// 			moderatorAddress,
// 		},
// 		{},
// 		{
// 			new: true,
// 			upsert: true,
// 		}
// 	);
// };

// FollowSchema.statics.deleteFollowRelation = function (
// 	userAddress,
// 	moderatorAddress
// ) {
// 	return this.deleteMany({
// 		userAddress,
// 		moderatorAddress,
// 	});
// };

module.exports = mongoose.model("TxRequest", TxRequestSchema);
