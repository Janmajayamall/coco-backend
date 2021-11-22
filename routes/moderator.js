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

/**
 * Returns a list of popular groups that are not
 * part of the ignoreList.
 */
router.post("/popular", async function (req, res) {
	const { ignoreList } = req.body;
	if (!Array.isArray(ignoreList)) {
		next("ignoreList should be array");
		return;
	}
	const oracleAddresses = await models.Post.aggregate([
		{
			$match: { oracleAddress: { $nin: ignoreList } },
		},
		{
			$group: { _id: "$oracleAddress", count: { $sum: 1 } },
		},
		{ $sort: { count: -1 } },
		{
			$limit: 20,
		},
	]);
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

/**
 * Find moderatos using a filter
 * @notice addresses stored in db are check
 */
router.post("/find", async function (req, res) {
	const { filter } = req.body;
	console.log(filter, " filter is here");
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
