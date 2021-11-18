const router = require("express").Router();
const {
	getOracleMarketParams,
	checkAddress,
	getOracleDelegate,
	getOracleAddress,
	getManagerAddress,
	toCheckSumAddress,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

/* 
Get Routes
 */
router.get("/popular", async function (req, res) {
	/* 
	Find popular moderators.
	Right now the one with most post is 
	considered the most popular
	 */
	const oracleAddresses = await models.Post.aggregate([
		{
			$sortByCount: "$oracleAddress",
		},
		{
			$limit: 10,
		},
	]);
	console.log(oracleAddresses, " oracleAddresses");
	const moderators = await models.Moderator.findByFilter({
		oracleAddress: {
			$in: oracleAddresses,
		},
	});

	res.status(200).send({
		success: true,
		response: { moderators },
	});
});

/* 
Post routes
 */

router.post("/find", async function (req, res) {
	const { filter } = req.body;
	const moderators = await models.Moderator.findByFilter(filter);
	res.status(200).send({
		success: true,
		response: { moderators },
	});
});

router.post("/update", [authenticate], async function (req, res, next) {
	var { oracleAddress, details } = req.body;
	oracleAddress = toCheckSumAddress(oracleAddress);

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
