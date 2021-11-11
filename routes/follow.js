 const router = require("express").Router();
const { checkAddress } = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/all", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	const relations = await models.Follow.findAllByFilter({
		userAddress: user.userColdAddress,
	});

	res.status(200).send({
		success: true,
		response: relations,
	});
});

router.post("/add", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	const { moderatorAddress } = req.body;
	if (!checkAddress(moderatorAddress)) {
		next("Invalid moderator address");
		return;
	}

	const moderatorExists = await models.Follow.findOneByAddress(
		moderatorAddress
	);
	if (!moderatorExists) {
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
	});
});

router.post("/remove", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	const { moderatorAddress } = req.body;
	if (!checkAddress(moderatorAddress)) {
		next("Invalid moderator address");
		return;
	}

	// remove follow
	await models.Follow.deleteFollowRelation(
		user.coldAddress,
		moderatorAddress
	);

	res.status(200).send({
		success: true,
	});
});

module.exports = router;
