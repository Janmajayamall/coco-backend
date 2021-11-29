var express = require("express");
const { connectDb } = require("./models");
const { urlencoded, json } = require("body-parser");
var cors = require("cors");
const { models } = require("./models");
const routes = require("./routes");
const Web3 = require("web3");
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");

require("dotenv").config({ path: __dirname + "/.env" });
const port = 5000;

var app = express();
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.use("/user", routes.user);
app.use("/post", routes.post);
app.use("/moderator", routes.moderator);
app.use("/follow", routes.follow);

async function main() {
	await connectDb();
	app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}`);
	});
}

main().catch((err) => console.log(err));

/**
 * Every input of address should be converted to lowercase
 * Every query related to address should be assumed lowercase
 */
