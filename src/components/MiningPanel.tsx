import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { miningSessionContract } from '../wagmi';

// ==========================================
// CONFIGURATION & CONTRACT DETAILS
// ==========================================
const MINER_CONTRACT_ADDRESS = miningSessionContract.address;

const MINER_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      }
    ],
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

interface MiningPanelProps {
  epoch: string | undefined;
  difficulty: string | undefined;
  target: string | undefined;
  shares: string;
  pendingRewards: string;
  loadingRewards: boolean;
}

export default function MiningPanel({
  epoch,
  difficulty,
  target,
  shares,
  pendingRewards,
  loadingRewards,
}: MiningPanelProps) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [isMining, setIsMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // 🔒 Lock reference to stop duplicate wallet prompts while one is open
  const isSigningRef = useRef(false);

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  // 1. Core Mining Engine Loop Configuration
  const startMining = () => {
    if (!address) {
      setError("Please connect your wallet first.");
      return;
    }
    setError(null);

    workerRef.current = new Worker(
      new URL('../mining-worker.js', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = async (e) => {
      const { status, hashrate: currentHashrate, totalHashes: runHashes, nonce } = e.data;

      if (status === 'PROGRESS') {
        setHashrate(currentHashrate);
        setTotalHashes(runHashes);
      } else if (status === 'SHARE_FOUND') {
        // If wallet popup is already active, skip triggering another one
        if (isSigningRef.current) {
          console.log("Wallet signing prompt already active. Skipping duplicate share prompt.");
          return;
        }

        stopMining(); // Pause worker loop while sending blockchain transaction

        try {
          isSigningRef.current = true;
          console.log(`✨ Valid nonce found: ${nonce}. Submitting share on-chain...`);
          
          const cleanNonce = typeof nonce === 'string' ? BigInt(nonce) : BigInt(nonce || 0);

          const tx = await writeContractAsync({
            address: MINER_CONTRACT_ADDRESS,
            abi: MINER_ABI,
            functionName: 'submitShare',
            args: [cleanNonce],
            gas: 150000n,
          });
          console.log("Share submitted successfully! Tx Hash:", tx);
        } catch (err: any) {
          // Gracefully suppress user rejection/denial warnings in the UI
          if (err?.code === 4001 || err?.message?.includes("User denied transaction signature")) {
            console.log("User dismissed transaction signature request.");
          } else {
            setError(err?.message || "Failed to submit discovered share to the network.");
          }
        } finally {
          isSigningRef.current = false;
          startMining(); // Auto-resume local worker after prompt resolves
        }
      }
    };

    workerRef.current.postMessage({
      cmd: 'START',
      target: target || "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      challenge: epoch || "0x0000000000000000000000000000000000000000000000000000000000000001",
      userAddress: address
    });

    setIsMining(true);
  };

  const stopMining = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ cmd: 'STOP' });
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsMining(false);
    setHashrate(0);
  };

  // 2. Claim Rewards Interaction
  const handleClaimRewards = async () => {
    if (!address) return;
    setError(null);
    setIsClaiming(true);

    try {
      const tx = await writeContractAsync({
        address: MINER_CONTRACT_ADDRESS,
        abi: MINER_ABI,
        functionName: 'claimRewards',
        gas: 100000n,
      });
      console.log("Claim transaction submitted successfully! Tx Hash:", tx);
    } catch (err: any) {
      if (err?.code === 4001 || err?.message?.includes("User denied transaction signature")) {
        console.log("User cancelled claim transaction.");
      } else {
        setError(err?.message || "Blockchain transaction failed while claiming rewards.");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const formattedRewards = pendingRewards !== "0"
    ? (Number(pendingRewards) / 1e18).toFixed(6)
    : "0.000000";

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0a0a0c', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#131316', border: '1px solid #222', borderRadius: '16px',
        width: '100%', maxWidth: '600px', padding: '30px', boxSizing: 'border-box'
      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px' }}>GPU Hashing Node</h2>
            <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '13px' }}>Epoch Stage: {epoch || '0'}</p>
          </div>
          <div style={{
            background: isMining ? 'rgba(0, 255, 204, 0.1)' : 'rgba(255, 68, 68, 0.1)',
            color: isMining ? '#00ffcc' : '#ff4444',
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
          }}>
            {isMining ? '● RUNNING' : '○ IDLE'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: '#1c1c21', padding: '15px', borderRadius: '8px' }}>
            <div style={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}>DIFFICULTY</div>
            <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>{difficulty || '16'}</div>
          </div>
          <div style={{ background: '#1c1c21', padding: '15px', borderRadius: '8px' }}>
            <div style={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}>ACCEPTED SHARES</div>
            <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>{shares}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: '#1c1c21', padding: '15px', borderRadius: '8px' }}>
            <div style={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}>HASHRATE</div>
            <div style={{ fontFamily: 'monospace', fontSize: '16px', color: '#00ffcc' }}>
              {hashrate > 1000000 ? `${(hashrate / 1000000).toFixed(2)} MH/s` : `${(hashrate / 1000).toFixed(2)} KH/s`}
            </div>
          </div>
          <div style={{ background: '#1c1c21', padding: '15px', borderRadius: '8px' }}>
            <div style={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}>RUN HASHES</div>
            <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>{totalHashes.toLocaleString()}</div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #16222f 0%, #131316 100%)',
          border: '1px solid #1e293b', padding: '20px', borderRadius: '8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>PENDING BALANCE {loadingRewards && '...'}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px', color: '#f8fafc' }}>
              {formattedRewards} <span style={{ fontSize: '14px', color: '#64748b' }}>HVLT</span>
            </div>
          </div>
          <button
            onClick={handleClaimRewards}
            disabled={pendingRewards === "0" || isClaiming}
            style={{
              padding: '10px 20px', background: '#ffffff', color: '#000',
              border: 'none', borderRadius: '6px', fontWeight: 'bold',
              cursor: (pendingRewards === "0" || isClaiming) ? 'not-allowed' : 'pointer',
              opacity: (pendingRewards === "0" || isClaiming) ? 0.4 : 1
            }}
          >
            {isClaiming ? 'Claiming...' : 'Claim'}
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444',
            color: '#ff4444', padding: '12px', borderRadius: '6px',
            fontSize: '13px', fontFamily: 'monospace', marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {isMining ? (
          <button
            onClick={stopMining}
            style={{
              padding: '14px', background: 'transparent', color: '#ff4444',
              border: '1px solid #ff4444', borderRadius: '8px', fontWeight: 'bold',
              cursor: 'pointer', width: '100%'
            }}
          >
            STOP ENGINE WORKER
          </button>
        ) : (
          <button
            onClick={startMining}
            style={{
              padding: '14px', background: '#00ffcc', color: '#000',
              border: 'none', borderRadius: '8px', fontWeight: 'bold',
              cursor: 'pointer', width: '100%'
            }}
          >
            ENGAGE HASHING THREADS
          </button>
        )}

      </div>
    </div>
  );
}
