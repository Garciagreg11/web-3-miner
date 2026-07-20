import React from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { miningSessionContract, rewardsVaultContract } from "../wagmi";
import MiningPanel from "./MiningPanel";

export default function Miner() {
  const { data: epoch } = useReadContract({
    ...miningSessionContract,
    functionName: "getCurrentEpoch",
  });

  const { data: difficulty } = useReadContract({
    ...miningSessionContract,
    functionName: "getDifficulty",
  });

  const { data: target } = useReadContract({
    ...miningSessionContract,
    functionName: "getTarget",
  });

  const { data: shares } = useReadContract({
    ...miningSessionContract,
    functionName: "getShares",
  });

  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    ...rewardsVaultContract,
    functionName: "getPendingRewards",
  });

  const { writeAsync: submitShare } = useWriteContract({
    ...miningSessionContract,
    functionName: "submitShare",
  });

  const { writeAsync: claimRewards } = useWriteContract({
    ...rewardsVaultContract,
    functionName: "claimRewards",
  });

  if (!epoch || !difficulty || !target) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "black",
          color: "white",
          fontSize: "20px",
        }}
      >
        Initializing mining session…
      </div>
    );
  }

  return (
    <MiningPanel
      epoch={epoch}
      difficulty={difficulty}
      target={target}
      shares={shares ?? 0n}
      pendingRewards={pendingRewards ?? 0n}
      loadingRewards={loadingRewards}
      submitShare={submitShare}
      claimRewards={claimRewards}
    />
  );
}
