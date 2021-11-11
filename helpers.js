const Web3 = require("web3");
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");
const oracleContractJson = require("./abis/Oracle.json");

async function txInputFromTxHashForNewMarket(txHash) {
	try {
		const tx = await web3.eth.getTransaction(txHash);

		var input = "0x" + tx.input.slice(10);
		input = web3.eth.abi.decodeParameters(
			["address", "address", "bytes32", "uint256", "uint256", "uint256"],
			input
		);
		return input;
	} catch (e) {
		return undefined;
	}
}

async function getOracleMarketParams(address) {
	try {
		const oracleContract = new web3.eth.Contract(
			oracleContractJson,
			address
		);
		const params = await oracleContract.methods.getMarketParams().call();

		// check necessary values
		if (
			!checkAddress(params[0]) ||
			typeof params[1] != "boolean" ||
			typeof params[2] != "number" ||
			typeof params[3] != "number" ||
			params[2] > params[3] ||
			typeof params[4] != "number" ||
			typeof params[5] != "number" ||
			typeof params[6] != "number" ||
			typeof params[7] != "number"
		) {
			throw Error("Invalid oracle market params");
		}

		return params;
	} catch (e) {
		return undefined;
	}
}

async function getOracleDelegate(address) {
	try {
		const oracleContract = new web3.eth.Contract(
			oracleContractJson,
			address
		);
		const delegate = await oracleContract.methods.getDelegate().call();
		return delegate;
	} catch (e) {
		console.log(e, ",l,l");
		return undefined;
	}
}

function verifySignature(msg, signature) {
	try {
		const address = web3.eth.accounts.recover(msg, signature);
		return address;
	} catch (e) {
		return "";
	}
}

function hashMsgForSignature(msg) {
	return web3.eth.accounts.hashMessage(msg);
}

function keccak256(msg) {
	return web3.utils.keccak256(msg);
}

function checkAddress(address) {
	return web3.utils.checkAddressChecksum(address);
}

module.exports = {
	txInputFromTxHashForNewMarket,
	verifySignature,
	hashMsgForSignature,
	getOracleMarketParams,
	checkAddress,
	keccak256,
	getOracleDelegate,
};
