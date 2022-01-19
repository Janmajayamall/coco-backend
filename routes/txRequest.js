/**
 * types of request
 * 1. Change name - off chain
 * 2. Change description - on chain
 * 3. change parameters - on chain
 * 4. add / remove members - on chain
 */

const router = require("express").Router();
const { getManagerAddress, isGoverningGroupMember } = require("./../helpers");
const { models } = require("./../models/index");
const { authenticate } = require("./middlewares");
const {
	MAX_LENGTH_NAME,
	MAX_LENGTH_DESCRIPTION,
	NAME_REGEX,
} = require("./../utils");

// used for creating new group tx request
router.post("/newRequest", [authenticate], async function (req, res, next) {
	const user = req.user;
	const { txCalldata, txJsonStr, relayedOnChain, signature, oracleAddress } =
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
});

// used for adding your signatures to one of the tx requests
