'use client'

import React, { useEffect, useState } from 'react'
import { useAccount, useConnect, useReadContract, useWriteContract } from 'wagmi'
import MiningPanel from './components/MiningPanel'

// Import the direct network definitions from wagmi configuration
import { miningSessionContract } from './wagmi'

// Safely resolve the ABI array whether it's nested or flat
const rawAbi = miningSessionContract.abi as any;
const contractAbi = Array.isArray(rawAbi)
  ? rawAbi
  : rawAbi?.abi || rawAbi?.default || [];

export default function App() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, error } = useConnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ---------------- READ CONTRACT DATA ----------------

  const safeAddress = address || "0x0000000000000000000000000000000000000000"

  const { data: work, error: workError } = useReadContract({
    address: "0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA",
    abi: contractAbi,
    functionName: "getWork",
    query: { enabled: mounted && isConnected }
  })

  const safeEpoch = work && work[0] ? work[0] : "0x0000000000000000000000000000000000000000000000000000000000000000"

  const { data: shares } = useReadContract({
    address: "0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA",
    abi: contractAbi,
    functionName: "getShares",
    args: [safeEpoch, safeAddress],
    query: { enabled: isConnected && mounted && !!work }
  })

  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    address: "0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA",
    abi: contractAbi,
    functionName: "pendingRewards",
    args: [safeEpoch, safeAddress],
    query: { enabled: isConnected && mounted && !!work }
  })

  // ---------------- WRITE CONTRACT CALLS ----------------

  const { writeContractAsync } = useWriteContract()

  async function submitShare(nonce: bigint) {
    try {
      await writeContractAsync({
        address: "0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA",
        abi: contractAbi,
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
        address: "0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA",
        abi: contractAbi,
        functionName: "claimRewards",
        args: [work[0]],
      })
    } catch (err) {
      console.error("Claim error:", err)
    }
  }

  // ---------------- UI STATES ----------------

  if (!mounted) return null

  // Prompt wallet connection immediately
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

  // Fallback for RPC or runtime errors
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

  // ---------------- RENDER MINING PANEL DIRECTLY ----------------
  return (
    <MiningPanel
      epoch={work && work[0] ? work[0].toString() : "0"}
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
