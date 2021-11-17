const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		eventIdentifierStr: {
			type: String,
			required: true,
		},
		creatorColdAddress: {
			type: String,
			required: true,
		},
		oracleAddress: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: {},
	}
);

PostSchema.statics.findPostsByFilter = function (filter) {
	return this.find(filter);
};

PostSchema.statics.findPostAndUpdate = function (filter, updates) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
