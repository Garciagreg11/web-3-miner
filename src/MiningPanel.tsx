import React, { useState, useCallback } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { mine } from "../utils/miner";
import GPUCore from "./GPUCore";

export default function MiningPanel({
  miningSession,
  signer,
  pendingRewards,
  loadingRewards,
  claimRewards,
}) {
  const { connect, isPending } = useConnect();
  const { address, isConnected } = useAccount();

  const [isMining, setIsMining] = useState(false);
  const [lastNonce, setLastNonce] = useState(null);
  const [lastDifficulty, setLastDifficulty] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = () => {
    setError(null);
    connect({ connector: injected() });
  };

  const startMining = useCallback(async () => {
    if (!miningSession || !signer || !address) {
      setError("Wallet not connected or mining session unavailable");
      return;
    }

    setIsMining(true);
    setError(null);

    try {
      const sessionWithSigner = miningSession.connect(signer);
      const difficultyBN = await sessionWithSigner.getDifficulty();
      const difficultyNum = parseInt(difficultyBN.toString());
      setLastDifficulty(difficultyNum);

      const { nonce } = mine(difficultyNum, address);
      setLastNonce(nonce);

      const tx = await sessionWithSigner.submitShare(nonce);
      await tx.wait();
    } catch (e) {
      console.error("Mining error:", e);
      setError(e?.message || "Mining failed");
    } finally {
      setIsMining(false);
    }
  }, [miningSession, signer, address]);

  const handleClaim = useCallback(async () => {
    setError(null);
    try {
      await claimRewards();
    } catch (e) {
      console.error("Claim error:", e);
      setError(e?.message || "Failed to claim rewards");
    }
  }, [claimRewards]);

  const pendingDisplay =
    pendingRewards && pendingRewards > 0n
      ? (Number(pendingRewards) / 1e18).toFixed(6)
      : "0.000000";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px",
        background: "radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          borderRadius: "18px",
          border: "1px solid rgba(148, 163, 184, 0.4)",
          background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7))",
          boxShadow: "0 0 40px rgba(56,189,248,0.25), 0 0 80px rgba(59,130,246,0.35)",
          padding: "24px 28px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-40%",
            background: "radial-gradient(circle at 10% 0, rgba(56,189,248,0.18), transparent 55%), radial-gradient(circle at 90% 100%, rgba(34,197,94,0.18), transparent 55%)",
            opacity: 0.9,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b7280" }}>
              HASHVAULT
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, marginTop: "4px", color: "#e5e7eb" }}>
              GPU Mining Control Center
            </h1>
          </div>

          <div style={{ textAlign: "right", fontSize: "12px", color: "#9ca3af" }}>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.5)",
                background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: isMining ? "#22c55e" : "#ef4444",
                  boxShadow: isMining ? "0 0 10px rgba(34,197,94,0.8)" : "0 0 10px rgba(239,68,68,0.8)",
                }}
              />
              <span style={{ fontSize: "11px", textTransform: "uppercase" }}>
                {isMining ? "Mining Active" : "Idle"}
              </span>
            </div>
            <div style={{ marginTop: "6px" }}>
              <span style={{ color: "#6b7280" }}>Wallet: </span>
              <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected"}
              </span>
            </div>
          </div>
        </div>

        {/* Layout Split */}
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
          {/* Left Panel */}
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              background: "radial-gradient(circle at top, rgba(15,23,42,0.9), rgba(15,23,42,0.7))",
              padding: "16px 16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>GPU Reactor Core</div>
              <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase" }}>Real‑time Visualizer</div>
            </div>

            <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(148,163,184,0.35)" }}>
              <GPUCore />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                <div>
                  <span style={{ color: "#6b7280" }}>Difficulty: </span>
                  <span style={{ fontFamily: "monospace" }}>{lastDifficulty !== null ? lastDifficulty : "—"}</span>
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "#6b7280" }}>Last Nonce: </span>
                  <span style={{ fontFamily: "monospace" }}>{lastNonce !== null ? lastNonce : "—"}</span>
                </div>
              </div>

              <div>
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    disabled={isPending}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "999px",
                      border: "1px solid #00ffcc",
                      background: "linear-gradient(135deg, #047857, #10b981)",
                      color: "black",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isPending ? "Connecting..." : "Connect Wallet"}
                  </button>
                ) : (
                  <button
                    onClick={startMining}
                    disabled={isMining}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "999px",
                      border: isMining ? "1px solid #f87171" : "1px solid #3b82f6",
                      background: isMining ? "#b91c1c" : "#3b82f6",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isMining ? "Mining..." : "Start Mining"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid rgba(52,211,153,0.5)",
                background: "linear-gradient(145deg, rgba(6,78,59,0.9), rgba(5,46,22,0.9))",
                padding: "14px 16px 16px",
                boxShadow: "0 0 25px rgba(34,197,94,0.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#bbf7d0", textTransform: "uppercase" }}>Pending Rewards</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#ecfdf5", marginTop: "4px" }}>
                    {pendingDisplay} <span style={{ fontSize: "11px", color: "#bbf7d0" }}>HVLT</span>
                  </div>
                </div>
                <button
                  onClick={handleClaim}
                  disabled={!isConnected || pendingRewards === 0n}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    border: "1px solid rgba(187,247,208,0.9)",
                    background: "rgba(22,101,52,0.6)",
                    color: "#ecfdf5",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Claim
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(239,68,68,0.15)", color: "#fca5a5", fontSize: "12px" }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
