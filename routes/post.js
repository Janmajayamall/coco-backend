const router = require("express").Router();
const {
	txInputFromTxHashForNewMarket,
	keccak256,
	checkMarketExistsInOracle,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/new", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	const { oracleAddress, eventIdentifierStr } = req.body;

	const marketExists = await checkMarketExistsInOracle(
		user.coldAddress,
		oracleAddress,
		keccak256(eventIdentifierStr)
	);

	if (!marketExists) {
		next("Market does not exists");
		return;
	}

	const post = await models.Post.findPostAndUpdate(
		{
			creatorColdAddress: user.coldAddress,
			oracleAddress,
			eventIdentifierStr,
		},
		{}
	);

	res.status(200).send({
		success: true,
		response: {
			post,
		},
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
