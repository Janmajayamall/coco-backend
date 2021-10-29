const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		identifier: {
			type: String,
			require: true,
		},
		url: {
			type: String,
			require: true,
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
			require: true,
		},
		moderatorAddress: {
			type: String,
			require: true,
		},
	},
	{
		timestamps: {},
	}
);

PostSchema.statics.findPostByFilter = function (filter) {
	return this.findOne(filter);
};

const Post = mongoose.model("Message", PostSchema);

module.exports = Post;
