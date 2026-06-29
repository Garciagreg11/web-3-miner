'use client'

import React, { useEffect, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { ethers } from 'ethers'
import MiningPanel from './components/MiningPanel'

declare global {
  interface Window {
    ethereum?: any
  }
}

const MINING_SESSION_ADDRESS = import.meta.env.NEXT_PUBLIC_MINING_SESSION

const MINING_SESSION_ABI: any[] = [
  {
    "inputs": [
      { "internalType": "address", "name": "_vault", "type": "address" },
      { "internalType": "address", "name": "_devWallet", "type": "address" },
      { "internalType": "uint256", "name": "_initialDifficulty", "type": "uint256" },
      { "internalType": "uint256", "name": "_rewardPerShare", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "epoch", "type": "uint256" }],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentEpoch",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDifficulty",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "nonce", "type": "uint256" }],
    "name": "submitShare",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export function App() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, error } = useConnect()

  const [signer, setSigner] = useState<any>(null)
  const [miningSession, setMiningSession] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!window.ethereum || !isConnected || !address) {
        if (mounted) {
          setSigner(null)
          setMiningSession(null)
        }
        return
      }

      try {
        setIsInitializing(true)

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        const contract = new ethers.Contract(
          MINING_SESSION_ADDRESS,
          MINING_SESSION_ABI,
          signer
        )

        if (mounted) {
          setSigner(signer)
          setMiningSession(contract)
        }
      } catch (err) {
        console.error('Ethers initialization failed:', err)
      } finally {
        if (mounted) setIsInitializing(false)
      }
    }

    init()
    return () => { mounted = false }
  }, [isConnected, address])

  const handleClaimRewards = async () => {
    if (!miningSession) return
    try {
      const epoch = await miningSession.currentEpoch()
      const tx = await miningSession.claimRewards(epoch)
      await tx.wait()
    } catch (err) {
      console.error("Reward claim error:", err)
    }
  }

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
                borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
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

  if (isInitializing || !miningSession || !signer) {
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

  return (
    <MiningPanel
      miningSession={miningSession}
      signer={signer}
      pendingRewards={0n}
      loadingRewards={false}
      claimRewards={handleClaimRewards}
    />
  )
}
