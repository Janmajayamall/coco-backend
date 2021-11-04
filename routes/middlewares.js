const { verifySignature } = require("./../helpers");
const { models } = require("./../models/index");

async function authenticate(req, res, next) {
	const signInfo = req.body.signatures;
	const msg = req.body.msg;
	const keySignature = signInfo.keySignature;
	const msgSignature = signInfo.msgSignature;

	// get hot key of user
	const hotAddress = verifySignature(JSON.stringify(msg), msgSignature);

	// find user
	var user = await models.User.findUserByFilter({ hotAddress });

	if (user == undefined) {
		next("User does not exists!");
		return;
	}

	// verify keySignature
	const coldAddress = verifySignature(
		JSON.stringify({
			hotAddress,
			accountNonce: user.accountNonce,
		}),
		keySignature
	);

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
