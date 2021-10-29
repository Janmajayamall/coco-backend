var express = require("express");
const { connectDb } = require("./models");
const { urlencoded, json } = require("body-parser");
var Web3 = require("web3");
require("dotenv").config({ path: __dirname + "/.env" });
const port = 3000;

var app = express();
app.use(urlencoded({ extended: true }));
app.use(json());

const { models } = require("./models");

// function findUserByColdAddress(coldAddress) {
// 	return models.User.findOne({
// 		coldAddress: coldAddress,
// 	});
// }

app.use(async function (req, res, next) {});

app.get("/", async (req, res) => {
	// const user = new models.User({
	// 	name: "dawdad",
	// 	coldAddress: "dada",
	// 	hotAddress: "dwad",
	// });
	// await user.save();
	// console.log(user);
	// const user = await
	console.log(user);
	res.send("Hello World!");
});

// app.post("/post");

async function main() {
	// define simple schemas
	// 1. Post {url,likes,dislikes,date}
	// 2. User {username}
	// 3.
	await connectDb();

	// const sign = await web3.eth.accounts.sign(
	// );
	// console.log(sign);

	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`);
	});
}

main().catch((err) => console.log(err));
