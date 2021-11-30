const { verifySignature, toCheckSumAddress } = require("./../helpers");
const { models } = require("./../models/index");

async function authenticate(req, res, next) {
	const signInfo = req.body.signatures;
	const msg = req.body.msg;
	const keySignature = signInfo.keySignature;
	const msgSignature = signInfo.msgSignature;

	// get hot key of user
	let hotAddress = verifySignature(JSON.stringify(msg), msgSignature);
	hotAddress = hotAddress.toLowerCase();

	// find user
	var user = await models.User.findUserByFilter({
		hotAddress: hotAddress,
	});

	if (user == undefined) {
		next("User does not exists!");
		return;
	}

	// verify keySignature
	let coldAddress = verifySignature(
		`Sign your hot wallet with address ${toCheckSumAddress(
			hotAddress
		)} and nonce ${user.accountNonce} to login Mimi`,
		keySignature
	);
	coldAddress = coldAddress.toLowerCase();

	if (user.coldAddress != coldAddress) {
		next("Auth Err!");
		return;
	}

	req.user = user;
	req.body = msg;
	next();
}

module.exports = {
	authenticate,
};
