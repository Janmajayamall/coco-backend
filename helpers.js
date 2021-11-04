const Web3 = require("web3");
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");
const oracleContractJson = require("./abis/OracleMultiSig.json");

async function txInputFromTxHashForNewMarket(txHash) {
	const tx = await web3.eth.getTransaction(txHash);

	var input = "0x" + tx.input.slice(10);
	input = web3.eth.abi.decodeParameters(
		["address", "address", "bytes32", "uint256", "uint256", "uint256"],
		input
	);
	return input;
}

async function getOracleMarketParams(address) {
	try {
		const oracleContract = new web3.eth.Contract(
			oracleContractJson,
			address
		);
		const params = await oracleContract.methods.getMarketParams().call();
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
		const delegate = await oracleContract.methods.delegate().call();
		return delegate;
	} catch (e) {
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
