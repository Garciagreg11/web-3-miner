import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

// Replace with your actual contract deployment address on Base
const MINING_CONTRACT_ADDRESS = '0xYourMiningSessionContractAddress' as const;

const MINING_ABI = [
  {
    "inputs": [],
    "name": "getWork",
    "outputs": [
      { "internalType": "uint256", "name": "epoch", "type": "uint256" },
      { "internalType": "uint256", "name": "difficultyOut", "type": "uint256" },
      { "internalType": "uint256", "name": "targetOut", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "epoch", "type": "uint256" },
      { "internalType": "address", "name": "miner", "type": "address" }
    ],
    "name": "getShares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useMiner() {
  const { address } = useAccount();

  // 1. Get current mining stats (Epoch, Difficulty)
  const { data: workData } = useReadContract({
    address: MINING_CONTRACT_ADDRESS,
    abi: MINING_ABI,
    functionName: 'getWork',
  });

  const currentEpoch = workData ? Number(workData[0]) : 1;
  const currentDifficulty = workData ? Number(workData[1]) : 0;

  // 2. Get user shares bound to the secure epoch
  const { data: sharesData, refetch: refetchShares } = useReadContract({
    address: MINING_CONTRACT_ADDRESS,
    abi: MINING_ABI,
    functionName: 'getShares',
    args: [BigInt(currentEpoch), address!],
    query: { enabled: !!address },
  });

  return {
    currentEpoch,
    difficulty: currentDifficulty,
    shares: sharesData ? sharesData.toString() : '0',
    refetchShares
  };
}
