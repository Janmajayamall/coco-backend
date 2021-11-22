const router = require("express").Router();
const {
	txInputFromTxHashForNewMarket,
	keccak256,
	checkMarketExistsInOracle,
	marketIdentifierFrom,
	toCheckSumAddress,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/new", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	var { oracleAddress, eventIdentifierStr } = req.body;
	oracleAddress = toCheckSumAddress(oracleAddress);

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
			marketIdentifier: marketIdentifierFrom(
				user.coldAddress,
				keccak256(eventIdentifierStr),
				oracleAddress
			),
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

router.post("/newPostTrial", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	var { oracleAddress, eventIdentifierStr } = req.body;
	oracleAddress = toCheckSumAddress(oracleAddress);

	const marketExists = await checkMarketExistsInOracle(
		user.coldAddress,
		oracleAddress,
		eventIdentifierStr
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
			marketIdentifier: marketIdentifierFrom(
				user.coldAddress,
				eventIdentifierStr,
				oracleAddress
			),
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

module.exports = router;
