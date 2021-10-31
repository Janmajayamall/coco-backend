const router = require("express").Router();
const { getOracleMarketParams } = require("./../helpers");
const { models } = require("./../models/index");
const { param } = require("./user");

router.get("/", async function (req, res) {
	const list = await models.Moderator.findAll();
	res.status(200).send({
		success: true,
		res: list,
	});
});

router.post("/find", async function (req, res) {
	const { address } = req.body;
	const moderator = await models.Moderator.findOneByAddress(address);
	res.status(200).send({
		success: true,
		res: moderator,
	});
});

router.post("/add", async function (req, res, next) {
	const { address } = req.body;
	const params = getOracleMarketParams(address);
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
			}
		);
		res.status(200).send({
			success: true,
		});
	}
});

module.exports = router;
