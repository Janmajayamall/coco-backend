const router = require("express").Router();
const {
	verifySignature,
	txInputFromTxHashForNewMarket,
	keccak256,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/new", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	const { txHash, imageUrl, category } = req.body;
	const txInput = txInputFromTxHashForNewMarket(txHash);

	// marketCreator should be user
	if (txInput[0] != user.coldAddress) {
		next("Invalid user for market creation");
		return;
	}

	// check whether post already exists
	const postExists = await models.Post.findPostByFilter({
		identifier: txInput[2],
		creatorColdAddress: txInput[0],
		moderatorAddress: txInput[1],
	});
	if (postExists) {
		next("Post exists");
		return;
	}

	// check whether identifier is correct
	if (txInput[2] != keccak256(imageUrl + String(category))) {
		next("Incorrect imageUrl or category values supplied");
		return;
	}

	// new post
	const post = new models.Post({
		identifier: txInput[2],
		creatorColdAddress: txInput[0],
		moderatorAddress: txInput[1],
	});
	await post.save();

	res.status(200).send({
		success: true,
	});
});

router.post("/find", async function (req, res) {
	const { filter } = req.body;
	const posts = await models.Post.findPostsByFilter(filter);
	res.status(200).send({
		success: true,
		response: {
			posts: posts,
		},
	});
});

module.exports = router;
