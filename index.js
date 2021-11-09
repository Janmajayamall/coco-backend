var express = require("express");
const { connectDb } = require("./models");
const { urlencoded, json } = require("body-parser");
var cors = require("cors");
const { models } = require("./models");
const routes = require("./routes");
const Web3 = require("web3");
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");
const oracleContractJson = require("./abis/OracleMultiSig.json");

require("dotenv").config({ path: __dirname + "/.env" });
const port = 5000;

var app = express();
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.use("/user", routes.user);
app.use("/post", routes.post);
app.use("/moderator", routes.moderator);
app.user("/follow", routes.follow);

async function main() {
	await connectDb();
	app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}`);
	});
}

main().catch((err) => console.log(err));

/* 
Upcoming tasks
1. apis - create new post; request feed by category ; store user's settings preference (i.e. moderator's list, categories, threshold)
2. store common moderator list & category list
*/
