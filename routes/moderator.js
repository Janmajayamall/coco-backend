const router = require("express").Router();
const { getManagerAddress, isGoverningGroupMember } = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");
const {
	MAX_LENGTH_NAME,
	MAX_LENGTH_DESCRIPTION,
	NAME_REGEX,
} = require("./../utils");

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

router.post("/all", async function (req, res) {
	const moderators = await models.Moderator.findByFilter({});
	res.status(200).send({
		success: true,
		response: {
			moderators,
		},
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
 * @notice addresses stored in db are in lowercase
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

	// Check user is a member of the group governing the oracle.
	const isMember = await isGoverningGroupMember(
		oracleAddress,
		user.coldAddress
	);
	if (isMember == false) {
		next("Invalid member");
		return;
	}

	// check details are valid
	if (details.name != undefined) {
		if (
			typeof details.name !== "string" ||
			NAME_REGEX.test(details.name) ||
			details.name.length > MAX_LENGTH_NAME
		) {
			next("Invalid name value!");
			return;
		}

		// check name uniqueness
		const unique = await models.Moderator.checkNameUniqueness(
			details.name.trim().toLowerCase(),
			oracleAddress
		);
		if (!unique) {
			next("Name already taken!");
			return;
		}

		details = {
			...details,
			name: details.name.trim(),
			nameUniqueness: details.name.trim().toLowerCase(),
		};
	}
	if (details.description != undefined) {
		if (
			typeof details.description !== "string" ||
			details.description.length > MAX_LENGTH_DESCRIPTION
		) {
			next("Invalid description value!");
			return;
		}
	}

	const moderator = await models.Moderator.findModeratorAndUpdate(
		{
			oracleAddress,
		},
		{
			...details,
		}
	);

	// update follow
	await models.Follow.updateFollowRelation(
		req.user.coldAddress,
		oracleAddress
	);

	res.status(200).send({
		success: true,
		response: { moderator },
	});
});

router.post("/checkNameUniqueness", async function (req, res, next) {
	let { name, oracleAddress } = req.body;
	if (oracleAddress == undefined) {
		oracleAddress = "";
	}
	// check name uniqueness
	const unique = await models.Moderator.checkNameUniqueness(
		name.trim().toLowerCase(),
		oracleAddress.trim().toLowerCase()
	);
	res.status(200).send({
		success: true,
		response: {
			isNameUnique: unique,
		},
	});
});

module.exports = router;
