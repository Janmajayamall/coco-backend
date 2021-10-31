const { verifySignature } = require("./../helpers");

async function authenticate(req, res, next) {
	const signInfo = JSON.parse(req.body.signatures);
	const msg = JSON.parse(req.body.msg);
	const keySignature = signInfo.keySignature;
	const msgSignature = signInfo.msgSignature;

	// get hot key of user
	const hotAddress = verifySignature(msg, msgSignature);

	// get cold key of user
	const coldAddress = verifySignature(hotAddress, keySignature);

	// get expected hot address of the user
	var user = await models.User.findUserByColdAddress(coldAddress);
	if (user == undefined || user.hotAddress != hotAddress) {
		next("Auth ERR!");
	}

	req.user = user;
	next();
}

module.exports = {
	authenticate,
};
