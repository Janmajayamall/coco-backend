const router = require("express").Router();
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/all", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	const relations = await models.Follow.findByFilter({
		userAddress: user.coldAddress,
	});

	res.status(200).send({
		success: true,
		response: { relations },
	});
});

router.post("/add", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	var { moderatorAddress } = req.body;
	moderatorAddress = moderatorAddress.toLowerCase();

	const moderatorExists = await models.Moderator.findByFilter({
		oracleAddress: moderatorAddress,
	});

	if (!moderatorExists || moderatorExists.length == 0) {
		next("Moderator does not exists");
		return;
	}

	// new follow
	await models.Follow.updateFollowRelation(
		user.coldAddress,
		moderatorAddress
	);

	res.status(200).send({
		success: true,
		response: {
			moderatorAddress,
		},
	});
});

router.post("/remove", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	var { moderatorAddress } = req.body;

	// remove follow
	await models.Follow.deleteFollowRelation(
		user.coldAddress,
		moderatorAddress
	);

	res.status(200).send({
		success: true,
		response: {
			moderatorAddress,
		},
	});
});

module.exports = router;
