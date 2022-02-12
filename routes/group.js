const router = require("express").Router();
const { getManagerAddress } = require("../helpers");
const { models } = require("../models/index");
const { authenticate } = require("./middlewares");
const {
	MAX_LENGTH_NAME,
	MAX_LENGTH_DESCRIPTION,
	NAME_REGEX,
} = require("../utils");

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
	const groupAddresses = await models.Post.aggregate([
		{
			$match: { groupAddress: { $nin: ignoreList } },
		},
		{
			$group: { _id: "$groupAddress", count: { $sum: 1 } },
		},
		{ $sort: { count: -1 } },
		{
			$limit: 20,
		},
	]);
	const groups = await models.Group.findByFilter({
		groupAddress: {
			$in: groupAddresses,
		},
	});

	res.status(200).send({
		success: true,
		response: { groups },
	});
});

router.post("/all", async function (req, res) {
	const groups = await models.Group.findByFilter({});
	res.status(200).send({
		success: true,
		response: {
			groups,
		},
	});
});

/**
 * Returns details of groups present in groupIds
 * details include - name, address, postCount, followCount
 */
router.post("/findDetails", async function (req, res, next) {
	let { groupIds } = req.body;
	if (!Array.isArray(groupIds)) {
		next("groupIds should be a array");
		return;
	}

	// find details
	let detailsArr = [];
	for (let i = 0; i < groupIds.length; i++) {
		const id = groupIds[i];
		const group = await models.Group.findOne({ groupAddress: id });

		if (group) {
			// find post count
			let res = await models.Post.aggregate([
				{
					$match: { groupAddress: group.groupAddress },
				},
				{
					$count: "postCount",
				},
			]);

			const postCount = res.length > 0 ? res[0].postCount : 0;

			// find follower count
			res = await models.Follow.aggregate([
				{
					$match: { groupAddress: group.groupAddress },
				},
				{
					$count: "followCount",
				},
			]);

			const followCount = res.length > 0 ? res[0].followCount : 0;

			detailsArr.push({
				...group._doc,
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
 * Find groups using a filter
 * @notice addresses stored in db are in lowercase
 */
router.post("/find", async function (req, res) {
	const { filter } = req.body;
	const groups = await models.Group.findByFilter(filter);
	res.status(200).send({
		success: true,
		response: { groups },
	});
});

router.post("/update", [authenticate], async function (req, res, next) {
	let { groupAddress, details } = req.body;
	groupAddress = groupAddress.toLowerCase();

	// check caller is manager
	let managerAddress = await getManagerAddress(groupAddress);
	managerAddress =
		managerAddress != undefined
			? managerAddress.toLowerCase()
			: managerAddress;
	if (!managerAddress || managerAddress != req.user.coldAddress) {
		next("Invalid manager");
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
		const unique = await models.group.checkNameUniqueness(
			details.name.trim().toLowerCase(),
			groupAddress
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

	const group = await models.Group.findGroupAndUpdate(
		{
			groupAddress,
		},
		{
			...details,
		}
	);

	// update follow
	await models.Follow.updateFollowRelation(
		req.user.coldAddress,
		groupAddress
	);

	res.status(200).send({
		success: true,
		response: { group },
	});
});

router.post("/checkNameUniqueness", async function (req, res, next) {
	let { name, groupAddress } = req.body;
	if (groupAddress == undefined) {
		groupAddress = "";
	}
	// check name uniqueness
	const unique = await models.group.checkNameUniqueness(
		name.trim().toLowerCase(),
		groupAddress.trim().toLowerCase()
	);
	res.status(200).send({
		success: true,
		response: {
			isNameUnique: unique,
		},
	});
});

module.exports = router;
