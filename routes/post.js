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
const { s3GenerateUploadURL } = require("./../utils");

router.post("/upload", [authenticate], async function (req, res, next) {
	const user = req.user;
	const presignedUrl = await s3GenerateUploadURL(user.coldAddress);
	res.status(200).send({
		success: true,
		response: {
			presignedUrl,
		},
	});
});

router.post("/new", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	let { groupAddress, marketIdentifier, body, marketSignature, marketData } =
		req.body;
	console.log(groupAddress, marketIdentifier, body);
	groupAddress = groupAddress.toLowerCase();

	const post = await models.Post.findPostAndUpdate(
		{
			marketIdentifier,
			creatorColdAddress: user.coldAddress,
			groupAddress,
			body,
			marketSignature,
			marketData,
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
