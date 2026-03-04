"use client";

import { useState } from "react";
import { getProviderAndSigner, getContract } from "../lib/web3";

// TODO: paste your ABI here
const ABI = [];

export default function Home() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");

  async function connect() {
    try {
      setError("");
      setStatus("Connecting...");
      const { signer } = await getProviderAndSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      setStatus("Connected");
    } catch (e) {
      setStatus("Idle");
      setError(e.message || "Failed to connect");
    }
  }

  async function startMining() {
    try {
      setError("");
      setStatus("Mining...");
      const { signer } = await getProviderAndSigner();
      const contract = getContract(signer, ABI);
      const tx = await contract.mine(); // update if needed
      await tx.wait();
      setStatus("Mined");
    } catch (e) {
      setStatus("Connected");
      setError(e.message || "Mining failed");
    }
  }

  async function claimRewards() {
    try {
      setError("");
      setStatus("Claiming...");
      const { signer } = await getProviderAndSigner();
      const contract = getContract(signer, ABI);
      const tx = await contract.claim(); // update if needed
      await tx.wait();
      setStatus("Claimed");
    } catch (e) {
      setStatus("Connected");
      setError(e.message || "Claim failed");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 24,
          borderRadius: 16,
          background: "#020617",
          border: "1px solid #1f2937",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Web 3 Miner</h1>
        <p style={{ marginTop: 0, marginBottom: 16, color: "#9ca3af" }}>
          GG72 mining interface on Base Sepolia.
        </p>

        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#020617",
            border: "1px solid #111827",
            marginBottom: 16,
            fontSize: 14
          }}
        >
          <div><strong>Status:</strong> {status}</div>
          <div><strong>Account:</strong> {account || "Not connected"}</div>
          {error && (
            <div style={{ marginTop: 8, color: "#f97373" }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {!account && (
          <button
            onClick={connect}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg, #22c55e, #16a34a, #22c55e)",
              color: "#f9fafb",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 12
            }}
          >
            Connect Wallet
          </button>
        )}

        {account && (
          <>
            <button
              onClick={startMining}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #38bdf8, #0ea5e9, #38bdf8)",
                color: "#f9fafb",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 8
              }}
            >
              Start Mining
            </button>

            <button
              onClick={claimRewards}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid #4b5563",
                background: "transparent",
                color: "#e5e7eb",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Claim Rewards
            </button>
          </>
        )}
      </div>
    </main>
  );
}
