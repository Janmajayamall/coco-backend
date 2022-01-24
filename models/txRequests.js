const mongoose = require("mongoose");

const TxRequestSchema = new mongoose.Schema(
	{
		txCalldata: {
			type: String,
			required: true,
		},
		// txJsonStr: {
		// 	type: String,
		// 	required: true,
		// },
		requestType: {
			type: Number,
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
		readyToRelay: {
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

TxRequestSchema.statics.addSignature = async function (
	txCalldata,
	oracleAddress,
	signature
) {
	const response = await this.find({
		txCalldata,
		oracleAddress,
	});
	if (response == undefined || response.active == false) {
		return;
	}
	return this.findOneAndUpdate(
		{
			txCalldata,
			oracleAddress,
		},
		{
			...response,
			signatures: [...response.signatures, signature],
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
	return this.findOneAndUpdate(
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

TxRequestSchema.statics.setReadyToRelayTo = function (
	txCalldata,
	oracleAddress,
	readyToRelay
) {
	return this.findOneAndUpdate(
		{
			txCalldata,
			oracleAddress,
		},
		{ readyToRelay },
		{
			new: true,
		}
	);
};

module.exports = mongoose.model("TxRequest", TxRequestSchema);
