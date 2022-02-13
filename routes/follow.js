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

	var { groupAddress } = req.body;
	groupAddress = groupAddress.toLowerCase();

	const groupExists = await models.Group.findByFilter({
		groupAddress: groupAddress,
	});

	if (!groupExists || groupExists.length == 0) {
		next("Group does not exists");
		return;
	}

	// new follow
	await models.Follow.updateFollowRelation(user.coldAddress, groupAddress);

	res.status(200).send({
		success: true,
		response: {
			groupAddress,
		},
	});
});

router.post("/remove", [authenticate], async function (req, res, next) {
	const user = req.user;
	if (!user) {
		next("User not present");
		return;
	}

	var { groupAddress } = req.body;

	// remove follow
	await models.Follow.deleteFollowRelation(user.coldAddress, groupAddress);

	res.status(200).send({
		success: true,
		response: {
			groupAddress,
		},
	});
});

module.exports = router;
