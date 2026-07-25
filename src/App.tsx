import React from 'react';
import { useReadContract, useAccount, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';
import MiningPanel from './components/MiningPanel';

const MINER_CONTRACT_ADDRESS = '0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA';

const MINER_READ_ABI = [
  {
    "inputs": [],
    "name": "epoch",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "difficulty",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "target",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "shares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "pendingRewards",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const queryClient = new QueryClient();

function MainContent() {
  const { address } = useAccount();

  const { data: epochData } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: MINER_READ_ABI,
    functionName: 'epoch',
  });

  const { data: diffData } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: MINER_READ_ABI,
    functionName: 'difficulty',
  });

  const { data: targetData } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: MINER_READ_ABI,
    functionName: 'target',
  });

  const { data: sharesData } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: MINER_READ_ABI,
    functionName: 'shares',
    args: address ? [address] : undefined,
  });

  const { data: pendingData, isLoading: loadingRewards } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: MINER_READ_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
  });

  const formattedRewards = pendingData 
    ? (Number(pendingData) / 1e18).toFixed(6) 
    : "0.000000";

  return (
    <MiningPanel
      epoch={epochData ? epochData.toString() : '1'}
      difficulty={diffData ? diffData.toString() : '16'}
      target={targetData ? targetData.toString() : undefined}
      shares={sharesData ? sharesData.toString() : '0'}
      pendingRewards={formattedRewards}
      loadingRewards={loadingRewards}
    />
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MainContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
