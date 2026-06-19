import { useEffect, useState } from "react";
import { useMining } from "../context/MiningContext";

export default function RewardsPanel() {
  const { contract } = useMining();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    async function load() {
      if (!contract) return;

      try {
        const me = await contract.signer.getAddress();
        const p = await contract.pendingRewards(me);
        setPending(Number(p));
      } catch (err) {
        console.error("Rewards load error:", err);
      }
    }

    load();
  }, [contract]);

  async function claim() {
    if (!contract) return;

    try {
      const tx = await contract.claimRewards();
      await tx.wait();
      setPending(0);
    } catch (err) {
      console.error("Claim error:", err);
    }
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #444", marginTop: "20px" }}>
      <h2>Rewards</h2>
      <div>Pending Rewards: {pending}</div>
      <button onClick={claim} disabled={pending === 0}>
        Claim Rewards
      </button>
    </div>
  );
}
