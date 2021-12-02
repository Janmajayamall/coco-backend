var express = require("express");
const { connectDb } = require("./models");
const { urlencoded, json } = require("body-parser");
var cors = require("cors");
const { models } = require("./models");
const routes = require("./routes");
const Web3 = require("web3");

require("dotenv").config({ path: __dirname + "/.env" });
const port = 5000;

let intervalObj;
let rinkebyLatestBlockNumber = 0;

var app = express();
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.use("/user", routes.user);
app.use("/post", routes.post);
app.use("/moderator", routes.moderator);
app.use("/follow", routes.follow);
app.get("/latestBlockNumber", async function (req, res) {
	res.send({
		success: true,
		response: {
			rinkebyLatestBlockNumber,
		},
	});
});

async function main() {
	await connectDb();

	// keeping track of latest block number
	let web3Rinkeby = new Web3(process.env.ALCHEMY_API);
	rinkebyLatestBlockNumber = await web3Rinkeby.eth.getBlockNumber();
	intervalObj = setInterval(async () => {
		try {
			rinkebyLatestBlockNumber = await web3Rinkeby.eth.getBlockNumber();
		} catch (e) {
			console.log(e);
		}
	}, 60000);

	app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}`);
	});
}

main().catch((err) => {
	clearInterval(intervalObj);
});

/**
 * Every input of address should be converted to lowercase
 * Every query related to address should be assumed lowercase
 */
