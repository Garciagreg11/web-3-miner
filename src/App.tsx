'use client'

import React, { useEffect, useState } from 'react'
import {
  useAccount,
  useConnect,
  useReadContract,
  useWriteContract,
  useSwitchChain
} from 'wagmi'
import { base } from 'wagmi/chains'
import { formatEther } from 'viem'
import MiningPanel from './components/MiningPanel'

// Contract ABI and Address directly defined to avoid module export issues
const MINER_CONTRACT_ADDRESS = "0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA" as const;

const contractAbi = [
  {
    "inputs": [],
    "name": "getWork",
    "outputs": [
      { "type": "uint256", "name": "epoch" },
      { "type": "uint256", "name": "difficultyOut" },
      { "type": "uint256", "name": "targetOut" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "uint256", "name": "epoch" },
      { "type": "address", "name": "miner" }
    ],
    "name": "getShares",
    "outputs": [{ "type": "uint256", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "uint256", "name": "epoch" },
      { "type": "address", "name": "miner" }
    ],
    "name": "pendingRewards",
    "outputs": [{ "type": "uint256", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "nonce" }],
    "name": "submitShare",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "epoch" }],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function App() {
  const { isConnected, address, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { connect, connectors, error } = useConnect()
  const { writeContractAsync } = useWriteContract()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const safeAddress = address || "0x0000000000000000000000000000000000000000"

  // 1. getWork: 0 inputs -> returns (epoch, difficultyOut, targetOut)
  const { data: work, error: workError } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "getWork",
    chainId: base.id,
    query: { enabled: mounted && isConnected }
  })

  // Safely extract values whether work is returned as an Array or Object
  const workObj = work as any;
  const currentEpoch = workObj ? BigInt(workObj.epoch ?? workObj[0] ?? 0) : 0n;
  const currentDifficulty = workObj ? BigInt(workObj.difficultyOut ?? workObj[1] ?? 4) : 4n;
  const currentTarget = workObj ? BigInt(workObj.targetOut ?? workObj[2] ?? 0) : 0n;

  const isWorkLoaded = isConnected && mounted && !!work;

  // 2. getShares: 2 inputs -> [epoch, miner]
  const { data: shares } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "getShares",
    args: [currentEpoch, safeAddress],
    chainId: base.id,
    query: { enabled: isWorkLoaded }
  })

  // 3. pendingRewards: 2 inputs -> [epoch, minerAddr]
  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    address: MINER_CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "pendingRewards",
    args: [currentEpoch, safeAddress],
    chainId: base.id,
    query: { enabled: isWorkLoaded }
  })

  // ---------------- WRITE CONTRACT CALLS ----------------

  // Helper to ensure user is connected to Base mainnet
  const ensureBaseNetwork = async () => {
    if (chainId !== base.id && switchChainAsync) {
      await switchChainAsync({ chainId: base.id });
    }
  }

  // submitShare: 1 input -> [nonce]
  async function submitShare(nonce: bigint | string) {
    try {
      await ensureBaseNetwork();
      const cleanNonce = typeof nonce === 'string' ? BigInt(nonce) : nonce;

      await writeContractAsync({
        address: MINER_CONTRACT_ADDRESS,
        abi: contractAbi,
        functionName: "submitShare",
        args: [cleanNonce],
        chainId: base.id,
        gas: 150000n,
      })
    } catch (err) {
      console.error("Submit share error:", err)
    }
  }

  // claimRewards: 1 input -> [epoch]
  async function claimRewards() {
    try {
      if (!work) return;
      await ensureBaseNetwork();

      await writeContractAsync({
        address: MINER_CONTRACT_ADDRESS,
        abi: contractAbi,
        functionName: "claimRewards",
        args: [currentEpoch],
        chainId: base.id,
      })
    } catch (err) {
      console.error("Claim error:", err)
    }
  }

  // ---------------- UI STATES ----------------

  if (!mounted) return null

  if (!isConnected) {
    return (
      <div style={{
        backgroundColor: '#0a0a0c', color: '#fff', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center', padding: '50px 40px', background: '#131316',
          borderRadius: '16px', border: '1px solid #222', maxWidth: '450px', width: '90%'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>🔒</div>
          <h2>Dashboard Locked</h2>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>
            Connect your wallet to access your Web3 GPU miner.
          </p>

          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              style={{
                padding: '14px', background: '#00ffcc', color: '#000',
                borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                width: '100%', marginBottom: '10px', border: 'none'
              }}
            >
              Connect with {connector.name}
            </button>
          ))}

          {error && (
            <p style={{ color: '#ff4444', marginTop: '15px' }}>
              Error: {error.message}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (workError) {
    return (
      <div style={{
        backgroundColor: '#0a0a0c', color: '#fff', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div style={{ textAlign: 'center', background: '#131316', padding: '40px', borderRadius: '16px', border: '1px solid #ff4444', maxWidth: '450px' }}>
          <p style={{ color: '#ff4444', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            Contract Connection Error
          </p>
          <p style={{ color: '#aaa', fontSize: '14px' }}>
            {workError.message || "Unable to read data from the Base network contract."}
          </p>
        </div>
      </div>
    )
  }

  // Format pending rewards safely using formatEther
  const formattedRewards = pendingRewards
    ? formatEther(BigInt(pendingRewards.toString()))
    : "0.000000";

  return (
    <MiningPanel
      epoch={currentEpoch.toString()}
      difficulty={currentDifficulty.toString()}
      target={"0x" + currentTarget.toString(16)}
      shares={shares ? shares.toString() : "0"}
      pendingRewards={formattedRewards}
      loadingRewards={loadingRewards}
    />
  )
}
