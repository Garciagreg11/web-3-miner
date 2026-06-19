// src/components/MiningPanel.tsx
import React from "react";
import { useMiner } from "../hooks/useMiner";
import GPUCore from "./GPUCore";

export default function MiningPanel() {
  const {
    address,
    difficulty,
    hashrate,
    running,
    start,
    stop,
  } = useMiner();

  // TODO: wire real pendingRewards + claimRewards when RewardsVault hook is ready
  const pendingRewards = 0n;
  const pendingDisplay =
    pendingRewards && pendingRewards > 0n
      ? (Number(pendingRewards) / 1e18).toFixed(6)
      : "0.000000";

  const mining = running;
  const startMining = start;
  const stopMining = stop;
  const claimRewards = () => {};

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px",
        background:
          "radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          borderRadius: "18px",
          border: "1px solid rgba(148, 163, 184, 0.4)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7))",
          boxShadow:
            "0 0 40px rgba(56,189,248,0.25), 0 0 80px rgba(59,130,246,0.35)",
          padding: "24px 28px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            inset: "-40%",
            background:
              "radial-gradient(circle at 10% 0, rgba(56,189,248,0.18), transparent 55%), radial-gradient(circle at 90% 100%, rgba(34,197,94,0.18), transparent 55%)",
            opacity: 0.9,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#6b7280",
              }}
            >
              HASHVAULT
            </div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                marginTop: "4px",
                color: "#e5e7eb",
              }}
            >
              GPU Mining Control Center
            </h1>
          </div>

          <div
            style={{
              textAlign: "right",
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.5)",
                background:
                  "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))",
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
                  background: mining ? "#22c55e" : "#ef4444",
                  boxShadow: mining
                    ? "0 0 10px rgba(34,197,94,0.8)"
                    : "0 0 10px rgba(239,68,68,0.8)",
                }}
              />
              <span style={{ fontSize: "11px", textTransform: "uppercase" }}>
                {mining ? "Mining Active" : "Idle"}
              </span>
            </div>
            <div style={{ marginTop: "6px" }}>
              <span style={{ color: "#6b7280" }}>Wallet: </span>
              <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                {address
                  ? `${address.slice(0, 6)}…${address.slice(-4)}`
                  : "Not connected"}
              </span>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "20px",
          }}
        >
          {/* Left: 3D core + controls */}
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.4)",
              background:
                "radial-gradient(circle at top, rgba(15,23,42,0.9), rgba(15,23,42,0.7))",
              padding: "16px 16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                GPU Reactor Core
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Real‑time Visualizer
              </div>
            </div>

            <div
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.35)",
                background:
                  "radial-gradient(circle at 50% 0, rgba(15,23,42,0.9), rgba(15,23,42,0.95))",
              }}
            >
              <GPUCore />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "6px",
              }}
            >
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                <div>
                  <span style={{ color: "#6b7280" }}>Difficulty: </span>
                  <span style={{ fontFamily: "monospace" }}>
                    {difficulty ? difficulty.toString() : "Loading..."}
                  </span>
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "#6b7280" }}>Hashrate: </span>
                  <span style={{ fontFamily: "monospace" }}>
                    {hashrate.toFixed(2)} H/s
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {mining ? (
                  <button
                    onClick={stopMining}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "999px",
                      border: "1px solid rgba(248,113,113,0.7)",
                      background:
                        "linear-gradient(135deg, #7f1d1d, #b91c1c, #7f1d1d)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={startMining}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "999px",
                      border: "1px solid rgba(59,130,246,0.8)",
                      background:
                        "linear-gradient(135deg, #1d4ed8, #3b82f6, #1d4ed8)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Start Mining
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: stats + rewards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Rewards card (placeholder until wired) */}
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid rgba(52,211,153,0.5)",
                background:
                  "linear-gradient(145deg, rgba(6,78,59,0.9), rgba(5,46,22,0.9))",
                padding: "14px 16px 16px",
                boxShadow: "0 0 25px rgba(34,197,94,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#bbf7d0",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                    }}
                  >
                    Pending Rewards
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#ecfdf5",
                      marginTop: "4px",
                    }}
                  >
                    {pendingDisplay}{" "}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#bbf7d0",
                      }}
                    >
                      HVLT
                    </span>
                  </div>
                </div>
                <button
                  onClick={claimRewards}
                  disabled
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    border: "1px solid rgba(187,247,208,0.9)",
                    background: "rgba(22,101,52,0.6)",
                    color: "#ecfdf5",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "default",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    opacity: 0.5,
                  }}
                >
                  Claim
                </button>
              </div>

              <div
                style={{
                  marginTop: "10px",
                  height: "5px",
                  borderRadius: "999px",
                  background: "rgba(6,95,70,0.9)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "0%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #22c55e, #a3e635, #22c55e)",
                    boxShadow: "0 0 18px rgba(34,197,94,0.9)",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#bbf7d0",
                  opacity: 0.9,
                }}
              >
                Rewards will be wired once RewardsVault integration is added.
              </div>
            </div>

            {/* System status */}
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid rgba(148,163,184,0.5)",
                background:
                  "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))",
                padding: "12px 14px 14px",
                fontSize: "12px",
                color: "#9ca3af",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>
                  Miner Status
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    color: mining ? "#4ade80" : "#f97316",
                  }}
                >
                  {mining ? "RUNNING" : "IDLE"}
                </div>
              </div>
              <div>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>
                  Difficulty
                </div>
                <div style={{ fontFamily: "monospace" }}>
                  {difficulty ? difficulty.toString() : "Loading..."}
                </div>
              </div>
              <div>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>
                  Hashrate
                </div>
                <div style={{ fontFamily: "monospace" }}>
                  {hashrate.toFixed(2)} H/s
                </div>
              </div>
              <div>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>
                  Wallet
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "11px" }}>
                  {address
                    ? `${address.slice(0, 6)}…${address.slice(-4)}`
                    : "Not connected"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
