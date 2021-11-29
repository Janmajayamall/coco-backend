const aws = require("aws-sdk");
const crypto = require("crypto");

/**
 * s3 bucket config
 */
const region = "ap-southeast-1";
const bucketName = "meme-curation";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new aws.S3({
	region,
	accessKeyId,
	secretAccessKey,
	signatureVersion: "v4",
});

async function s3GenerateUploadURL(coldAddress) {
	const random = crypto.randomBytes(32).toString("hex");
	const imageName = `${coldAddress}-${random}`;

	const params = {
		Bucket: bucketName,
		Key: imageName,
		Expires: 60,
	};

	const uploadURL = await s3.getSignedUrlPromise("putObject", params);
	return uploadURL;
}

module.exports = { s3GenerateUploadURL };
