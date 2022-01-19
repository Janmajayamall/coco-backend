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
		active: {
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

TxRequestSchema.statics.findOneAndUpdate = function (filter, updates) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

TxRequestSchema.statics.addSignature = function (
	txCalldata,
	oracleAddress,
	signature
) {
	const req = await this.find({
		txCalldata,
		oracleAddress,
	});
	if (req == undefined || req.active == false) {
		return;
	}
	return await this.findOneAndUpdate(
		{
			txCalldata,
			oracleAddress,
		},
		{
			...req,
			signatures: [...req.signatures, signature],
		},
		{
			new: true,
		}
	);
};

TxRequestSchema.statics.setActiveTo = function (
	txCalldata,
	oracleAddress,
	isActive
) {
	return await this.findOneAndUpdate(
		{
			txCalldata,
			oracleAddress,
		},
		{ active: isActive },
		{
			new: true,
		}
	);
};

TxRequestSchema.statics.setStatusTo = function (
	txCalldata,
	oracleAddress,
	status
) {
	return await this.findOneAndUpdate(
		{
			txCalldata,
			oracleAddress,
		},
		{ status },
		{
			new: true,
		}
	);
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
