const Web3 = require("web3");
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");
const oracleContractJson = require("./abis/Oracle.json");

const ORACLE_FACTORY_ADDRESS = "0x35858C861564F072724658458C1c9C22F5506c36";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function strToHash(str) {
	return web3.utils.asciiToHex(str);
}

function marketIdentifierFrom(creatorAddress, eventIdentifier, oracleAddress) {
	const encoding = web3.eth.abi.encodeParameters(
		["address", "bytes32", "address"],
		[
			toCheckSumAddress(creatorAddress),
			eventIdentifier,
			toCheckSumAddress(oracleAddress),
			
		]
	);
	return keccak256(encoding);
}

async function checkMarketExistsInOracle(
	creatorAddress,
	oracleAddress,
	eventIdentifier
) {
	const marketIdentifier = marketIdentifierFrom(
		creatorAddress,
		eventIdentifier,
		oracleAddress
	);

	try {
		const contract = new web3.eth.Contract(
			oracleContractJson,
			oracleAddress
		);

		const creator = await contract.methods
			.creators(marketIdentifier)
			.call();

		if (!creator || creator == ZERO_ADDRESS) {
			throw new Error("Market does not exist");
		}
		return true;
	} catch (e) {
		console.log(`Error - ${e}`);
		return false;
	}
}

async function getOracleAddress(txHash) {
	try {
		const receipt = await web3.eth.getTransactionReceipt(txHash);

		// check to is OracleFactory
		if (receipt.to != ORACLE_FACTORY_ADDRESS) {
			throw new Error("Invalid tx");
		}

		const oracleAddress = receipt.logs[0].topics[1];
		return `0x${oracleAddress.slice(26)}`.toLowerCase();
	} catch (e) {
		console.log(`Error - ${e}`);
		return;
	}
}

async function getManagerAddress(oracleAddress) {
	try {
		const contract = new web3.eth.Contract(
			oracleContractJson,
			oracleAddress
		);

		const manager = await contract.methods.manager().call();
		if (!manager || manager == ZERO_ADDRESS) {
			throw new Error("Manager does not exist");
		}

		return manager.toLowerCase();
	} catch (e) {
		console.log(`Error - ${e}`);
		return;
	}
}

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

function toCheckSumAddress(address) {
	return web3.utils.toChecksumAddress(address);
}

module.exports = {
	txInputFromTxHashForNewMarket,
	verifySignature,
	hashMsgForSignature,
	getOracleMarketParams,
	checkAddress,
	keccak256,
	getOracleDelegate,

	checkMarketExistsInOracle,
	getOracleAddress,
	getManagerAddress,
	marketIdentifierFrom,
	toCheckSumAddress,
};

/**
 * S3 bucket
 */
