const router = require("express").Router();
const { verifySignature } = require("./../helpers");
const { models } = require("./../models/index");

router.post("/login", async function (req, res) {
	const { hotAddress, signature } = req.body;
	const coldAddress = verifySignature(hotAddress, signature);

	// update user values & store it
	await models.User.findUserAndUpdate({
		coldAddress: coldAddress,
		hotAddress: hotAddress,
	});

	res.status(200).send({
		success: true,
	});
});

module.exports = router;
