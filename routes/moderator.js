const router = require("express").Router();
const {
	getOracleMarketParams,
	checkAddress,
	getOracleDelegate,
	getOracleAddress,
	getManagerAddress,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.post("/find", async function (req, res) {
	const { filter } = req.body;
	const moderators = await models.Moderator.findByFilter(filter);
	res.status(200).send({
		success: true,
		response: { moderators },
	});
});

router.post("/update", [authenticate], async function (req, res, next) {
	const { oracleAddress, details } = req.body;
	if (!checkAddress(oracleAddress)) {
		next("Invalid address");
		return;
	}

	// check caller is manager
	const managerAddress = await getManagerAddress(oracleAddress);

	if (!managerAddress || managerAddress != req.user.coldAddress) {
		next("Invalid manager");
		return;
	}

	const moderator = await models.Moderator.findModeratorAndUpdate(
		{
			oracleAddress,
		},
		{
			...details,
		}
	);

	res.status(200).send({
		success: true,
		response: { moderator },
	});
});

module.exports = router;
