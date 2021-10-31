const router = require("express").Router();
const { verifySignature } = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/login", async function (req, res, next) {
	const { hotAddress, signature, timestamp } = req.body;

	const coldAddress = verifySignature(
		JSON.stringify({
			hotAddress: hotAddress,
			timestamp: timestamp,
		}),
		signature
	);

	timestamp = Date.parse(timestamp);

	var user = models.User.findUserByColdAddress(coldAddress);

	if (user == undefined || user.timestamp.getTime() <= timestamp.getTime()) {
		// update user values
		await models.User.findUserAndUpdate(
			{
				coldAddress: coldAddress,
			},
			{
				hotAddress: hotAddress,
				timestamp: timestamp,
			}
		);
	} else {
		next("Invalid login!");
	}

	res.status(200).send({
		success: true,
	});
});

// save config
router.post("/profile", authenticate, async function (req, res) {
	const { settings } = req.body;

	await models.User.findUserAndUpdate(
		{ coldAddress: req.user.coldAddress },
		settings
	);

	res.status(200).send({
		success: true,
	});
});

module.exports = router;
