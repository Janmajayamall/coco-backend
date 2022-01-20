/**
 * types of request
 * 1. Change name - off chain
 * 2. Change description - on chain
 * 3. change parameters - on chain
 * 4. add / remove members - on chain
 */

const router = require("express").Router();
const { isGoverningGroupMember } = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");

// used for creating new group tx request
router.post("/newRequest", [authenticate], async function (req, res, next) {
	const user = req.user;
	const { txCalldata, txJsonStr, requestType, signature, oracleAddress } =
		req.body;

	// Check user is a member of the group governing the oracle.
	const isMember = await isGoverningGroupMember(
		oracleAddress,
		user.coldAddress
	);
	if (isMember == false) {
		next("Invalid member");
		return;
	}

	// check whether tx request can be relayed
	const readyToRelay = didReceivedEnoughSignatures(
		txCalldata,
		oracleAddress,
		[signature]
	);

	// add tx request to db
	const txReq = await models.TxRequest.findOneAndUpdate(
		{
			txCalldata,
			oracleAddress,
		},
		{
			txCalldata,
			txJsonStr,
			requestType,
			signatures: [signature],
			oracleAddress,
			readyToRelay,
			active: true,
		}
	);

	res.status(200).send({
		success: true,
		response: {
			txRequest: txReq,
		},
	});
});

// used for adding signatures to one of the tx requests
router.post("/signRequest", [authenticate], async function (req, res, next) {
	const user = req.user;
	const { txCalldata, signature, oracleAddress } = req.body;

	// Check user is a member of the group governing the oracle.
	const isMember = await isGoverningGroupMember(
		oracleAddress,
		user.coldAddress
	);
	if (isMember == false) {
		next("Invalid member");
		return;
	}

	// add signature to tx req
	let txReq = await models.TxRequest.addSignature(
		txCalldata,
		oracleAddress,
		signature
	);
	if (txReq == undefined) {
		next("Invalid tx request");
		return;
	}

	// check whether tx request can be relayed
	const readyToRelay = didReceivedEnoughSignatures(
		txCalldata,
		oracleAddress,
		txReq.signatures
	);

	if (readyToRelay == true) {
		// update status = true
		txReq = await models.TxRequest.setReadyToRelayTo(
			txCalldata,
			oracleAddress,
			true
		);
	}

	res.status(200).send({
		success: true,
		response: {
			txRequest: txReq,
		},
	});
});

// mark tx request as inactive
router.post("/setInactive", [authenticate], async function (req, res, next) {
	const user = req.user;
	const { txCalldata, oracleAddress } = req.body;

	// Check user is a member of the group governing the oracle.
	const isMember = await isGoverningGroupMember(
		oracleAddress,
		user.coldAddress
	);
	if (isMember == false) {
		next("Invalid member");
		return;
	}

	let txReq = await models.TxRequest.setActiveTo(
		txCalldata,
		oracleAddress,
		false
	);
	res.status(200).send({
		success: true,
		response: {
			txRequest: txReq,
		},
	});
});

router.post("/find", async function (req, res) {
	const { filter } = req.body;
	const txRequests = await models.TxRequest.findByFilter(filter);
	res.status(200).send({
		success: true,
		response: {
			txRequests,
		},
	});
});
