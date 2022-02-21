require("dotenv").config({ path: __dirname + "/.env" });
var express = require("express");
const { connectDb } = require("./models");
const { urlencoded, json } = require("body-parser");
var cors = require("cors");
const routes = require("./routes");
const Web3 = require("web3");
const morgan = require("morgan");
const { logger } = require("./logger");

const port = process.env.PORT || 8080;

const morganMiddleware = morgan(
	":method :url :status :res[content-length] - :response-time ms",
	{
		stream: {
			// Configure Morgan to use our custom logger with the http severity
			write: (message) => logger.http(message.trim()),
		},
	}
);

let intervalObj;

var app = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(morganMiddleware);

app.use("/user", routes.user);
app.use("/post", routes.post);
app.use("/group", routes.group);
app.use("/follow", routes.follow);

async function main() {
	try {
		await connectDb();
	} catch (e) {
		logger.error(`[main] unable to connect to DB`);
	}

	app.listen(port, () => {
		logger.info(`Listening at http://localhost:${port}`);
	});
}

main().catch((err) => {
	clearInterval(intervalObj);
});
