"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { MINING_SESSION_ABI } from "@/lib/abi/miningSession";
import { MINING_SESSION_ADDRESS } from "@/lib/contracts";

export default function AdminPage() {
  const { address } = useAccount();

  const [target, setTarget] = useState("");
  const [reward, setReward] = useState("");
  const [epoch, setEpoch] = useState("");

  const { data: currentEpoch } = useReadContract({
    address: MINING_SESSION_ADDRESS,
    abi: MINING_SESSION_ABI,
    functionName: "currentEpoch"
  });

  const { data: currentTarget } = useReadContract({
    address: MINING_SESSION_ADDRESS,
    abi: MINING_SESSION_ABI,
    functionName: "target"
  });

  const { data: rewardPerShare } = useReadContract({
    address: MINING_SESSION_ADDRESS,
    abi: MINING_SESSION_ABI,
    functionName: "rewardPerShare"
  });

  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    if (currentEpoch) setEpoch(currentEpoch.toString());
    if (currentTarget) setTarget(currentTarget.toString());
    if (rewardPerShare) setReward(rewardPerShare.toString());
  }, [currentEpoch, currentTarget, rewardPerShare]);

  const updateParams = () => {
    writeContract({
      address: MINING_SESSION_ADDRESS,
      abi: MINING_SESSION_ABI,
      functionName: "updateParams",
      args: [target, reward]
    });
  };

  const startNewEpoch = () => {
    writeContract({
      address: MINING_SESSION_ADDRESS,
      abi: MINING_SESSION_ABI,
      functionName: "startNewEpoch",
      args: [target, reward]
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      {!address && (
        <div className="text-red-500 text-lg">
          Connect your wallet to access admin controls.
        </div>
      )}

      {address && (
        <>
          <div className="space-y-2">
            <div>Current Epoch: {epoch}</div>
            <div>Current Target: {target}</div>
            <div>Reward Per Share: {reward}</div>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <label className="block mb-1">New Difficulty Target</label>
              <input
                className="border p-2 w-full"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1">New Reward Per Share</label>
              <input
                className="border p-2 w-full"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </div>

            <button
              onClick={updateParams}
              disabled={isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isPending ? "Updating..." : "Update Params"}
            </button>

            <button
              onClick={startNewEpoch}
              disabled={isPending}
              className="px-6 py-3 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {isPending ? "Starting..." : "Start New Epoch"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
