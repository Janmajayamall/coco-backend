const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		identifier: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			required: true,
		},
		likes: {
			type: [String],
			default: [],
		},
		dislikes: {
			type: [String],
			default: [],
		},
		category: {
			type: Number,
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
