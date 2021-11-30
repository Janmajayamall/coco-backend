const router = require("express").Router();
const { getManagerAddress } = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

/* 
Get Routes
 */

/* 
Post routes
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

/**
 * Returns details of moderators present in moderatorIds
 * details include - name, address, postCount, followCount
 */
router.post("/findDetails", async function (req, res, next) {
	let { moderatorIds } = req.body;
	if (!Array.isArray(moderatorIds)) {
		next("moderatorIds should be a array");
		return;
	}

	// find details
	let detailsArr = [];
	for (let i = 0; i < moderatorIds.length; i++) {
		const id = moderatorIds[i];
		const moderator = await models.Moderator.findOne({ oracleAddress: id });

		if (moderator) {
			// find post count
			let res = await models.Post.aggregate([
				{
					$match: { oracleAddress: moderator.oracleAddress },
				},
				{
					$count: "postCount",
				},
			]);

			const postCount = res.length > 0 ? res[0].postCount : 0;

			// find follower count
			res = await models.Follow.aggregate([
				{
					$match: { moderatorAddress: moderator.oracleAddress },
				},
				{
					$count: "followCount",
				},
			]);

			const followCount = res.length > 0 ? res[0].followCount : 0;

			detailsArr.push({
				...moderator._doc,
				postCount,
				followCount,
			});
		}
	}

	res.status(200).send({
		success: true,
		response: {
			groupsDetails: detailsArr,
		},
	});
});

/**
 * Find moderatos using a filter
 * @notice addresses stored in db are check
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
	let { oracleAddress, details } = req.body;
	oracleAddress = oracleAddress.toLowerCase();

	// check caller is manager
	let managerAddress = await getManagerAddress(oracleAddress);
	managerAddress =
		managerAddress != undefined
			? managerAddress.toLowerCase()
			: managerAddress;
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
