export const abi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "signer",
				type: "address",
			},
			{
				indexed: false,
				internalType: "string",
				name: "message",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "imageUrl",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "NewEntry",
		type: "event",
	},
	{
		inputs: [],
		name: "getEntryCount",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "string", name: "message", type: "string" },
			{ internalType: "string", name: "imageUrl", type: "string" },
		],
		name: "signGuestbook",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "totalEntries",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
];

export const CONTRACT_ADDRESS = "0x64db8B9EccdFeaC65cdC8c1B0F25d79431BB8B7E";
