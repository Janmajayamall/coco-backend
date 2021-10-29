const router = require("express").Router();
const {
	verifySignature,
	txInputFromTxHashForNewMarket,
	hashMsg,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/new", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
	}

	const { txHash, imageUrl, category } = req.body;
	const txInput = txInputFromTxHashForNewMarket(txHash);

	// marketCreator should be user
	if (txInput[0] != user.coldAddress) {
		next("Invalid user for market creation");
	}

	// check whether post already exists
	const postExists = await models.Post.findPostByFilter({
		identifier: txInput[2],
		creatorColdAddress: txInput[0],
		moderatorAddress: txInput[1],
	});
	if (postExists) {
		next("Post exists");
	}

	// check whether identifier is correct
	if (txInput[2] != hashMsg(imageUrl + String(category))) {
		next("Incorrect imageUrl or category values supplied");
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

module.exports = router;
