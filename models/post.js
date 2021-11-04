const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		identifier: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		creatorColdAddress: {
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

PostSchema.statics.findPostsByFilter = function (filter) {
	return this.find(filter);
};

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
