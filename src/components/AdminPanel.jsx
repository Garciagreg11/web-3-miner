import { useEffect, useState } from "react";
import { useMining } from "../context/MiningContext";

export default function AdminPanel() {
  const { contract } = useMining();
  const [difficulty, setDifficulty] = useState(null);
  const [owner, setOwner] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!contract) return;

      try {
        const d = await contract.difficulty();
        const o = await contract.owner();
        const m = await contract.signer.getAddress();     
        

        setDifficulty(Number(d));
        setOwner(o);
        setMe(m);
      } catch (err) {
        console.error("Admin load error:", err);
      }
    }

    load();
  }, [contract]);

  const isOwner = owner && me && owner.toLowerCase() === me.toLowerCase();

  async function increaseDifficulty() {
    if (!isOwner) return;
    setLoading(true);
    try {
      const tx = await contract.setDifficulty(difficulty + 1);
      await tx.wait();
      setDifficulty(difficulty + 1);
    } catch (err) {
      console.error("Increase difficulty error:", err);
    }
    setLoading(false);
  }

  async function decreaseDifficulty() {
    if (!isOwner || difficulty <= 1) return;
    setLoading(true);
    try {
      const tx = await contract.setDifficulty(difficulty - 1);
      await tx.wait();
      setDifficulty(difficulty - 1);
    } catch (err) {
      console.error("Decrease difficulty error:", err);
    }
    setLoading(false);
  }

  async function forceSubmitShare() {
    if (!isOwner) return;
    setLoading(true);
    try {
      const tx = await contract.forceSubmitShare(1);
      await tx.wait();
    } catch (err) {
      console.error("Force submit error:", err);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #444", marginTop: "20px" }}>
      <h2>Admin Panel</h2>

      {!isOwner && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          You are not the contract owner.
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <strong>Current Difficulty:</strong> {difficulty}
      </div>

      <button onClick={increaseDifficulty} disabled={!isOwner || loading}>
        Increase Difficulty
      </button>

      <button
        onClick={decreaseDifficulty}
        disabled={!isOwner || loading || difficulty <= 1}
        style={{ marginLeft: "10px" }}
      >
        Decrease Difficulty
      </button>

      <div style={{ marginTop: "20px" }}>
        <button onClick={forceSubmitShare} disabled={!isOwner || loading}>
          Force Submit Share
        </button>
      </div>
    </div>
  );
}
