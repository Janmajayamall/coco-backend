const Web3 = require("web3");
const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");
const callerContractJson = require("./abis/Caller.json");

const ORACLE_FACTORY_ADDRESS = "0x35858C861564F072724658458C1c9C22F5506c36";
const CALLER_ADDRESS = "0x35858C861564F072724658458C1c9C22F5506c36";
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
			callerContractJson,
			CALLER_ADDRESS
		);

		const exists = await contract.methods
			.marketExistsInOracle(oracleAddress, marketIdentifier)
			.call();

		return exists;
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
			callerContractJson,
			CALLER_ADDRESS
		);

		const manager = await contract.methods.manager(oracleAddress).call();
		if (!manager || manager == ZERO_ADDRESS) {
			throw new Error("Manager does not exist");
		}

		return manager.toLowerCase();
	} catch (e) {
		console.log(`Error - ${e}`);
		return;
	}
}

async function isGoverningGroupMember(oracleAddress, userAddress) {
	try {
		const contract = new web3.eth.Contract(
			callerContractJson,
			CALLER_ADDRESS
		);

		const check = await contract.methods
			.isGoverningGroupMember(userAddress, oracleAddress)
			.call();
		return check;
	} catch (e) {
		console.log(`Error - ${e}`);
		return false;
	}
}

async function didReceivedEnoughSignatures(
	txCalldata,
	oracleAddress,
	signaturesArr
) {
	try {
		const contract = new web3.eth.Contract(
			callerContractJson,
			CALLER_ADDRESS
		);

		const check = await contract.methods
			.didReceivedEnoughSignatures(
				txCalldata,
				signaturesBytesFromArr(signaturesArr),
				oracleAddress
			)
			.call();
		return check;
	} catch (e) {
		console.log(`Error - ${e}`);
		return false;
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

function signaturesBytesFromArr(signaturesArr) {
	let signs = "0x";
	signaturesArr.forEach((sign) => {
		signs += sign.substr(2);
	});
	return web3.utils.hexToBytes(signs);
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
	isGoverningGroupMember,
	signaturesBytesFromArr,
	didReceivedEnoughSignatures,
};

/**
 * S3 bucket
 */
