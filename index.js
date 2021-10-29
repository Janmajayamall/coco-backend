var express = require("express");
const { connectDb } = require("./models");
const { urlencoded, json } = require("body-parser");
const { models } = require("./models");
const routes = require("./routes");
require("dotenv").config({ path: __dirname + "/.env" });
const port = 3000;

var app = express();
app.use(urlencoded({ extended: true }));
app.use(json());

app.use("/user", routes.user);
app.use("/post", routes.post);

async function main() {
	await connectDb();
	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`);
	});
}

main().catch((err) => console.log(err));
