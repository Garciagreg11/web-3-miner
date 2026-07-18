'use client'

import React from 'react'
import { useAccount, useConnect, useReadContract, useWriteContract } from 'wagmi'
import MiningPanel from './components/MiningPanel'

import miningSessionAbi from "./abi/MiningSession.json"
import { MINING_SESSION } from "./addresses"

// 1. Target the nested Hardhat ABI property safely
const abiArray = Array.isArray(miningSessionAbi)
  ? miningSessionAbi
  : (miningSessionAbi as any).abi || (miningSessionAbi as any).default || [];

// 2. Silence noisy WebSocket warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('WebSocket') || args[0].includes('close()'))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

export default function App() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, error } = useConnect()

  // ---------------- READ CONTRACT DATA ----------------

  const { data: work, isLoading: loadingWork, error: workError } = useReadContract({
    address: MINING_SESSION,
    abi: abiArray,
    functionName: "getWork",
    query: { enabled: isConnected } // Only fire when a wallet context is established
  })

  // Debug logs safely tracking state outside of hook configuration option limits
  console.log("DEBUG - Current Contract Address being called:", MINING_SESSION)
  console.log("DEBUG - Contract Work Data:", work)
  if (workError) {
    console.error("DEBUG - Contract Work Hook Error Details:", workError)
  }

  // Safe fallback values to prevent Ethers/Viem from crashing during initial undefined renders
  const safeEpoch = work && work[0] ? work[0] : "0x0000000000000000000000000000000000000000000000000000000000000000"
  const safeAddress = address || "0x0000000000000000000000000000000000000000"

  const { data: shares } = useReadContract({
    address: MINING_SESSION,
    abi: abiArray,
    functionName: "getShares",
    args: [safeEpoch, safeAddress],
    query: { enabled: !!work && isConnected }
  })

  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    address: MINING_SESSION,
    abi: abiArray,
    functionName: "pendingRewards",
    args: [safeEpoch, safeAddress],
    query: { enabled: !!work && isConnected }
  })

  // ---------------- WRITE CONTRACT CALLS ----------------

  const { writeContractAsync } = useWriteContract()

  async function submitShare(nonce: bigint) {
    try {
      await writeContractAsync({
        address: MINING_SESSION,
        abi: abiArray,
        functionName: "submitShare",
        args: [nonce],
      })
    } catch (err) {
      console.error("Submit share error:", err)
    }
  }

  async function claimRewards() {
    try {
      if (!work) return
      await writeContractAsync({
        address: MINING_SESSION,
        abi: abiArray,
        functionName: "claimRewards",
        args: [work[0]],
      })
    } catch (err) {
      console.error("Claim error:", err)
    }
  }

  // ---------------- UI STATES ----------------

  // GUARD 1: If wallet isn't connected, prompt them immediately!
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

  // GUARD 2: Once connected, wait for blockchain data to stream down
  if (loadingWork || !work || work.length === 0) {
    return (
      <div style={{
        backgroundColor: '#0a0a0c', color: '#fff', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <p style={{ color: '#00ffcc', fontSize: '18px', fontWeight: 'bold' }}>
          Initializing Mining Session...
        </p>
      </div>
    )
  }

  // ---------------- RENDER MINING PANEL ----------------
  return (
    <MiningPanel
      epoch={work[0]?.toString()}
      difficulty="4"
      target="0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      shares={shares ? shares.toString() : "0"}
      pendingRewards={pendingRewards ? pendingRewards.toString() : "0"}
      loadingRewards={loadingRewards}
      submitShare={submitShare}
      claimRewards={claimRewards}
    />
  )
}
