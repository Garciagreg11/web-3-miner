'use client'

import React from 'react'
import { useAccount, useConnect, useReadContract, useWriteContract } from 'wagmi'
import MiningPanel from './components/MiningPanel'

// Import the verified contract setup directly from your wagmi configuration
import { miningSessionContract } from './wagmi'

// Cast the ABI properly for wagmi's strict type checker
const contractAbi = miningSessionContract.abi as any;

export default function App() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, error } = useConnect()

  // ---------------- READ CONTRACT DATA ----------------

  // Querying using the clean contract metadata bound to the Base network configuration
  const { data: work, isLoading: loadingWork, error: workError } = useReadContract({
    address: miningSessionContract.address,
    abi: contractAbi,
    functionName: "getWork",
  })

  // Safely fallback parameters to avoid throwing undefined evaluation errors inside active query states
  const safeEpoch = work && work[0] ? work[0] : "0x0000000000000000000000000000000000000000000000000000000000000000"
  const safeAddress = address || "0x0000000000000000000000000000000000000000"

  const { data: shares } = useReadContract({
    address: miningSessionContract.address,
    abi: contractAbi,
    functionName: "getShares",
    args: [safeEpoch, safeAddress],
    query: { enabled: !!work && !!address }
  })

  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    address: miningSessionContract.address,
    abi: contractAbi,
    functionName: "pendingRewards",
    args: [safeEpoch, safeAddress],
    query: { enabled: !!work && !!address }
  })

  // ---------------- WRITE CONTRACT CALLS ----------------

  const { writeContractAsync } = useWriteContract()

  async function submitShare(nonce: bigint) {
    try {
      await writeContractAsync({
        address: miningSessionContract.address,
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
        address: miningSessionContract.address,
        abi: contractAbi,
        functionName: "claimRewards",
        args: [work[0]],
      })
    } catch (err) {
      console.error("Claim error:", err)
    }
  }

  // ---------------- UI STATES ----------------

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

  // Graceful handling if the RPC node throws an exception or fails to hit the contract
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
            {workError.message || "Unable to read mining session data from the Base network."}
          </p>
        </div>
      </div>
    )
  }

  // Guard against missing data during the network initialization payload load window
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
