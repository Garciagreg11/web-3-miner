import React from 'react';
import { useReadContract, useWriteContract, useAccount, useConnect, useDisconnect, WagmiProvider, usePublicClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';
import MiningPanel from './components/MiningPanel';
import { CONTRACTS } from './constants/contracts';

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

const MINER_WRITE_ABI = [
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
  }
] as const;

const queryClient = new QueryClient();

function ConnectWalletHeader() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '15px 20px',
      maxWidth: '600px',
      margin: '0 auto -10px auto'
    }}>
      {isConnected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            color: '#00ffcc',
            fontSize: '12px',
            fontFamily: 'monospace',
            background: 'rgba(0, 255, 204, 0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 255, 204, 0.3)'
          }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            style={{
              background: '#222',
              color: '#aaa',
              border: '1px solid #333',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            const injectedConnector = connectors.find((c) => c.id === 'injected') || connectors[0];
            if (injectedConnector) connect({ connector: injectedConnector });
          }}
          style={{
            background: '#00ffcc',
            color: '#000',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

function MainContent() {
  const { address, chainId = baseSepolia.id } = useAccount();
  const publicClient = usePublicClient();

  // Dynamically pull active contract addresses based on connected chain
  const activeContracts = CONTRACTS[chainId as keyof typeof CONTRACTS] || CONTRACTS[baseSepolia.id];

  // Async contract writer
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  // Contract state readers with refetch capabilities
  const { data: epochData } = useReadContract({
    address: activeContracts.miningSession,
    abi: MINER_READ_ABI,
    functionName: 'epoch',
  });

  const { data: diffData } = useReadContract({
    address: activeContracts.miningSession,
    abi: MINER_READ_ABI,
    functionName: 'difficulty',
  });

  const { data: targetData } = useReadContract({
    address: activeContracts.miningSession,
    abi: MINER_READ_ABI,
    functionName: 'target',
  });

  const { data: sharesData, refetch: refetchShares } = useReadContract({
    address: activeContracts.miningSession,
    abi: MINER_READ_ABI,
    functionName: 'shares',
    args: address ? [address] : undefined,
  });

  const { data: pendingData, isLoading: loadingRewards, refetch: refetchRewards } = useReadContract({
    address: activeContracts.miningSession,
    abi: MINER_READ_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
  });

  const refetchAll = async () => {
    await Promise.all([refetchShares(), refetchRewards()]);
  };

  // Submission Handler
  const handleSubmitShare = async (nonce: string, onSubmitted?: () => void) => {
    try {
      const hash = await writeContractAsync({
        address: activeContracts.miningSession,
        abi: MINER_WRITE_ABI,
        functionName: 'submitShare',
        args: [BigInt(nonce)],
        chainId: baseSepolia.id,
      });

      // Wait for block confirmation on Base Sepolia
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Update on-chain numbers in UI
      await refetchAll();

      // Trigger callback to clear solved share state & send RESUME to mining-worker.js
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("Failed to submit share:", err);
    }
  };

  // Claim Handler
  const handleClaim = async () => {
    try {
      const hash = await writeContractAsync({
        address: activeContracts.rewardsVault || activeContracts.miningSession,
        abi: MINER_WRITE_ABI,
        functionName: 'claimRewards',
        chainId: baseSepolia.id,
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      await refetchAll();
    } catch (err) {
      console.error("Failed to claim rewards:", err);
    }
  };

  const formattedRewards = pendingData
    ? (Number(pendingData) / 1e18).toFixed(6)
    : "0.000000";

  return (
    <div>
      <ConnectWalletHeader />
      <MiningPanel
        epoch={epochData ? epochData.toString() : '1'}
        difficulty={diffData ? diffData.toString() : '16'}
        target={targetData ? targetData.toString() : undefined}
        shares={sharesData ? sharesData.toString() : '0'}
        pendingRewards={formattedRewards}
        loadingRewards={loadingRewards}
        onSubmitShare={handleSubmitShare}
        onClaim={handleClaim}
        isWriting={isWriting}
      />
    </div>
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
