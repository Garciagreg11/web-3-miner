import React from 'react';
import { useReadContract, useAccount, useConnect, useDisconnect, WagmiProvider } from 'wagmi';
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
    <div>
      <ConnectWalletHeader />
      <MiningPanel
        epoch={epochData ? epochData.toString() : '1'}
        difficulty={diffData ? diffData.toString() : '16'}
        target={targetData ? targetData.toString() : undefined}
        shares={sharesData ? sharesData.toString() : '0'}
        pendingRewards={formattedRewards}
        loadingRewards={loadingRewards}
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
