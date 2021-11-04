const router = require("express").Router();
const { verifySignature, checkAddress } = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/login", async function (req, res, next) {
	var { hotAddress, keySignature, accountNonce } = req.body;

	// checksum hotAddress
	if (!checkAddress(hotAddress)) {
		next("Invalid hot address!");
	}

	var coldAddress = verifySignature(
		JSON.stringify({
			hotAddress,
			accountNonce,
		}),
		keySignature
	);

	var user = await models.User.findUserByFilter({ coldAddress });

	if (user == undefined || user.accountNonce < accountNonce) {
		// update user values
		await models.User.findUserAndUpdate(
			{
				coldAddress: coldAddress,
			},
			{
				hotAddress,
				accountNonce,
			}
		);

		res.status(200).send({
			success: true,
		});
	} else {
		next("Invalid login!");
	}
});

router.post("/auth", authenticate, async function (req, res) {
	res.status(200).send({
		success: true,
	});
});

router.post("/update", authenticate, async function (req, res) {
	const { settings } = req.body;

	await models.User.findUserAndUpdate(
		{ coldAddress: req.user.coldAddress },
		settings
	);

	res.status(200).send({
		success: true,
	});
});

router.post("/profile", authenticate, async function (req, res) {
	res.status(200).send({
		success: true,
		response: {
			user: req.user,
		},
	});
});

router.post("/accountNonce", async function (req, res, next) {
	var { coldAddress } = req.body;
	if (!checkAddress(coldAddress)) {
		next("Invalid cold address!");
		return;
	}

	const user = await models.User.findUserByFilter({ coldAddress });
	var accountNonce = -1;
	if (user != undefined) {
		accountNonce = user.accountNonce;
	}
	res.status(200).send({
		success: true,
		response: { accountNonce },
	});
});

module.exports = router;
