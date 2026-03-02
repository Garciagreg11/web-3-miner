export const REWARDS_VAULT_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_rewardToken", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "fund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "miner", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "payMiner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
