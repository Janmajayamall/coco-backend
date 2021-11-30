const router = require("express").Router();
const {
	verifySignature,

	toCheckSumAddress,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/login", async function (req, res, next) {
	let { hotAddress, keySignature, accountNonce } = req.body;
	hotAddress = hotAddress.toLowerCase();

	let coldAddress = verifySignature(
		`Sign your hot wallet with address ${toCheckSumAddress(
			hotAddress
		)} and nonce ${accountNonce} to login Mimi`,
		keySignature
	);
	coldAddress = coldAddress.toLowerCase();

	var user = await models.User.findUserByFilter({ coldAddress });

	if (user == undefined || user.accountNonce < accountNonce) {
		// update user values
		user = await models.User.findUserAndUpdate(
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
			response: { user },
		});
	} else {
		next("Invalid login!");
		return;
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
	let { coldAddress } = req.body;

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
