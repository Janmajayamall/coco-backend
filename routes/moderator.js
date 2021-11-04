const router = require("express").Router();
const {
	getOracleMarketParams,
	checkAddress,
	getOracleDelegate,
} = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

router.get("/", async function (req, res) {
	const list = await models.Moderator.findAll();
	res.status(200).send({
		success: true,
		response: list,
	});
});

router.post("/find", async function (req, res) {
	const { address } = req.body;
	const moderator = await models.Moderator.findOneByAddress(address);
	res.status(200).send({
		success: true,
		response: moderator,
	});
});

router.post("/update", [authenticate], async function (req, res, next) {
	const { address, details } = req.body;
	if (!checkAddress(address)) {
		next("Invalid address!");
		return;
	}

	const delegate = await getOracleDelegate(address);
	if (delegate == undefined || req.user.coldAddress != delegate) {
		next("Invalid delegate");
		return;
	}

	if (typeof details != typeof {}) {
		next("Details should be Object type");
		return;
	}

	const params = await getOracleMarketParams(address);

	if (params == undefined) {
		next("Invalid moderator address");
	} else {
		await models.Moderator.findModeratorAndUpdate(
			{ address: address },
			{
				tokeC: params[0],
				isActive: params[1],
				feeNumerator: Number(params[2]),
				feeDenominator: Number(params[3]),
				donEscalationLimit: Number(params[4]),
				expireBufferBlocks: Number(params[5]),
				donBufferBlocks: Number(params[6]),
				resolutionBufferBlocks: Number(params[7]),

				// details
				...details,
			}
		);
		res.status(200).send({
			success: true,
		});
	}
});

module.exports = router;
