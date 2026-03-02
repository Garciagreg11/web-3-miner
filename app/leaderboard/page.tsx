"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { MINING_SESSION_ABI } from "@/lib/abi/miningSession";
import { MINING_SESSION_ADDRESS } from "@/lib/contracts";

export default function LeaderboardPage() {
  const [miners, setMiners] = useState([
    // Temporary static list — replace with real indexer later
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333"
  ]);

  const [scores, setScores] = useState([]);

  const fetchShares = async () => {
    const results = await Promise.all(
      miners.map(async (miner) => {
        const shares = await window.ethereum.request({
          method: "eth_call",
          params: [
            {
              to: MINING_SESSION_ADDRESS,
              data: new window.ethers.utils.Interface(MINING_SESSION_ABI)
                .encodeFunctionData("miners", [miner])
            },
            "latest"
          ]
        });

        const decoded = new window.ethers.utils.Interface(MINING_SESSION_ABI)
          .decodeFunctionResult("miners", shares);

        return {
          miner,
          shares: decoded[0].toString()
        };
      })
    );

    const sorted = results.sort((a, b) => Number(b.shares) - Number(a.shares));
    setScores(sorted);
  };

  useEffect(() => {
    fetchShares();
    const interval = setInterval(fetchShares, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Rank</th>
            <th className="text-left p-2">Miner</th>
            <th className="text-left p-2">Shares</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((entry, i) => (
            <tr key={entry.miner} className="border-b">
              <td className="p-2">{i + 1}</td>
              <td className="p-2 font-mono">{entry.miner}</td>
              <td className="p-2">{entry.shares}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
