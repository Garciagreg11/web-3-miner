export const MINING_SESSION_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_vault", "type": "address" },
      { "internalType": "uint256", "name": "_initialTarget", "type": "uint256" },
      { "internalType": "uint256", "name": "_rewardPerShare", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "nonce", "type": "uint256" }],
    "name": "submitShare",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "minerAddr", "type": "address" }],
    "name": "pendingRewards",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
