/**
 * types of request
 * 1. Change name - off chain
 * 2. Change description - on chain
 * 3. change parameters - on chain
 * 4. add / remove members - on chain
 */

const router = require("express").Router();
const { getManagerAddress } = require("./../helpers");
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
	const { txCalldata, txJsonStr, relayedOnChain, signatures, oracleAddress } =
		req.body;

	// Check user is a member of the group governing the oracle.
	// I think this will require a chain of requests
	// that first checks whether oracleAddress exists
	// or not. Then retrieves gnosis multisig address (i.e. owner address).
	// Then checks whether user is part of the multi sig
	// wallet or not.

	// add tx request to db

	// check whether tx request can be relayed
	// if then update status to true, otherwise false
});

// used for adding your signatures to one of the tx requests
