const s3 = require("./s3");
const constants = require("./constants");

module.exports = {
	...s3,
	...constants,
};
