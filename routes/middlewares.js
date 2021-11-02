const { verifySignature } = require("./../helpers");
const { models } = require("./../models/index");

async function authenticate(req, res, next) {
	const signInfo = req.body.signatures;
	const msg = req.body.msg;
	const keySignature = signInfo.keySignature;
	const msgSignature = signInfo.msgSignature;

	// get hot key of user
	const hotAddress = verifySignature(JSON.stringify(msg), msgSignature);
	console.log(hotAddress, " derived hot address");

	// find user
	var user = await models.User.findUserByFilter({ hotAddress });
	console.log(user, " user retrieved for authentication");

	if (user == undefined) {
		next("User does not exists!");
	}

	// verify keySignature
	const coldAddress = verifySignature(
		JSON.stringify({
			hotAddress,
			accountNonce: user.accountNonce,
		}),
		keySignature
	);
	console.log(coldAddress, " derived cold address");
	if (user.coldAddress != coldAddress) {
		next("Auth Err!");
	}

	req.user = user;
	next();
}

module.exports = {
	authenticate,
};
