import React, { useState, useEffect, useRef } from 'react';
import { useReadContract } from 'wagmi';

interface MiningPanelProps {
  userAddress: `0x${string}` | undefined;
  contractAddress: string;
  submitShare: (nonce: string) => void;
  onShareAccepted: () => void;
}

// ABI snippet for fetching the current live mining puzzle parameters
const SESSION_ABI = [
  {
    "inputs": [],
    "name": "getMiningChallenge",
    "outputs": [
      { "internalType": "bytes32", "name": "challenge", "type": "bytes32" },
      { "internalType": "uint256", "name": "target", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export default function MiningPanel({ userAddress, contractAddress, submitShare, onShareAccepted }: MiningPanelProps) {
  const [isMining, setIsMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  // Read current mining parameters from the Session contract (polls every 30s)
  const { data: miningJob } = useReadContract({
    address: '0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA', // Your Session Contract
    abi: SESSION_ABI,
    functionName: 'getMiningChallenge',
    query: { refetchInterval: 30000 } 
  });

  // Reactive Effect: Watches the contract state. 
  // If the challenge updates while mining is active, it hot-swaps the worker immediately.
  useEffect(() => {
    if (isMining && miningJob && miningJob[0] && miningJob[1] && userAddress) {
      
      // 1. Terminate any existing worker to prevent thread leaks and stale hashes
      if (workerRef.current) {
        console.log("DEBUG: Terminating worker due to contract block update.");
        workerRef.current.terminate();
      }

      const challenge = miningJob[0];
      const target = miningJob[1];

      console.log("DEBUG: Spawning worker with fresh challenge:", challenge);

      // 2. Instantiate a fresh background thread worker
      workerRef.current = new Worker(new URL('../mining-worker.js', import.meta.url), { type: 'module' });

      // 3. Handle worker performance updates and found shares
      workerRef.current.onmessage = (e) => {
        const { status, hashrate, totalHashes, nonce } = e.data;

        if (status === 'PROGRESS') {
          setHashrate(hashrate);
          setTotalHashes(totalHashes);
        } else if (status === 'SHARE_FOUND') {
          console.log("DEBUG: Valid nonce discovered!", nonce);
          setIsMining(false);
          setHashrate(0);

          // Submit the valid nonce up to your wallet provider
          submitShare(nonce);
          onShareAccepted();
        }
      };

      // 4. Fire up the hashing engine with the active network parameters
      workerRef.current.postMessage({
        cmd: 'START',
        challenge,
        target: target.toString(), // Safely pass BigInt as string
        userAddress
      });
    }
  }, [miningJob, isMining, userAddress, submitShare, onShareAccepted]);

  // Safeguard: Ensure background threads are killed when the component is unmounted
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const startMining = () => {
    if (!userAddress || !miningJob || !miningJob[0] || !miningJob[1]) return;
    setIsMining(true); // Flipped to true, triggering the useEffect above to spin up the worker
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

  return (
    <div className="border border-zinc-800 bg-zinc-950/30 p-6 rounded space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-zinc-300">GPU // CPU HARDWARE LINK</h3>
          <p className="text-xs text-zinc-500">Session Target: {contractAddress ? `${contractAddress.slice(0, 10)}...` : '0x0000...'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isMining && <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />}
          <span className="text-xs text-zinc-400 font-mono">{isMining ? 'ACTIVE' : 'IDLE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-950 p-4 border border-zinc-900 rounded">
          <div className="text-xs text-zinc-500 mb-1">HASHRATE</div>
          <div className="text-xl font-bold tracking-tight text-pink-400">
            {hashrate > 1000000 ? `${(hashrate / 1000000).toFixed(2)} MH/s` : `${(hashrate / 1000).toFixed(2)} KH/s`}
          </div>
        </div>

        <div className="bg-zinc-950 p-4 border border-zinc-900 rounded">
          <div className="text-xs text-zinc-500 mb-1">TOTAL HASHES IN RUN</div>
          <div className="text-xl font-bold tracking-tight text-zinc-300">
            {totalHashes.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="pt-2">
        {isMining ? (
          <button
            onClick={stopMining}
            className="w-full py-3 text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition tracking-widest"
          >
            TERMINATE WORKER ENGINE
          </button>
        ) : (
          <button
            onClick={startMining}
            disabled={!miningJob || !userAddress}
            className="w-full py-3 text-xs font-bold border border-pink-500/40 bg-pink-500/20 text-pink-400 rounded hover:bg-pink-500/30 transition tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ENGAGE HASHING THREADS
          </button>
        )}
      </div>
    </div>
  );
}
