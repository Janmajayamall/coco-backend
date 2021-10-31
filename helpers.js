const Web3 = require("web3");
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");
const oracleContractJson = require("./abis/OracleMultiSig.json");

async function txInputFromTxHashForNewMarket(txHash) {
	const tx = await web3.eth.getTransaction(txHash);
	var input = "0x" + tx.input.slice(10);
	input = web3.eth.abi.decodeParameters(
		["address", "address", "bytes32", "uint256"],
		input
	);
	return input;
}

async function getOracleMarketParams(address) {
	try {
		const oracleContract = web3.eth.Contract(oracleContractJson, address);
		const params = oracleContract.methods.getMarketParams().call();
		return params;
	} catch (e) {
		return undefined;
	}
}

function verifySignature(msg, signature) {
	try {
		const hash = web3.eth.accounts.hashMessage(msg);
		const address = web3.eth.accounts.recover(hash, signature);
		return address;
	} catch (e) {
		return "";
	}
}

function hashMsg(msg) {
	return web3.eth.accounts.hashMessage(msg);
}

module.exports = {
	txInputFromTxHashForNewMarket,
	verifySignature,
	hashMsg,
	getOracleMarketParams,
};
