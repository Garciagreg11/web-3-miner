"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { MINING_SESSION_ABI } from "@/lib/abi/miningSession";
import { MINING_SESSION_ADDRESS } from "@/lib/contracts";

export default function RewardsPage() {
  const { address } = useAccount();
  const [pending, setPending] = useState("0");

  const { data: pendingRewards, refetch } = useReadContract({
    address: MINING_SESSION_ADDRESS,
    abi: MINING_SESSION_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    if (pendingRewards) {
      setPending(pendingRewards.toString());
    }
  }, [pendingRewards]);

  const claim = () => {
    writeContract({
      address: MINING_SESSION_ADDRESS,
      abi: MINING_SESSION_ABI,
      functionName: "claimRewards"
    });

    // Refresh pending rewards after claiming
    setTimeout(() => refetch(), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Rewards</h1>

      {!address && (
        <div className="text-red-500 text-lg">
          Connect your wallet to view rewards.
        </div>
      )}

      {address && (
        <>
          <div className="text-xl">
            Pending Rewards:{" "}
            <span className="font-mono">{pending}</span>
          </div>

          <button
            onClick={claim}
            disabled={isPending || pending === "0"}
            className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isPending ? "Claiming..." : "Claim Rewards"}
          </button>
        </>
      )}
    </div>
  );
}
