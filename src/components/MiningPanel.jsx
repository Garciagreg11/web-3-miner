import { useState, useCallback } from "react"
import { useAccount, useConnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { mine } from "../utils/miner"

export default function MiningPanel({
  miningSession,
  signer,
  pendingRewards,
  loadingRewards,
  claimRewards,
}) {
  const { connect, isPending } = useConnect()
  const { address, isConnected } = useAccount()

  const [isMining, setIsMining] = useState(false)
  const [lastNonce, setLastNonce] = useState(null)
  const [lastDifficulty, setLastDifficulty] = useState(null)
  const [error, setError] = useState(null)

  const handleConnect = () => {
    setError(null)
    connect({ connector: injected() })
  }

  const startMining = useCallback(async () => {
    if (!miningSession || !signer || !address) {
      setError("Wallet not connected or mining session unavailable")
      return
    }

    setIsMining(true)
    setError(null)

    try {
      const sessionWithSigner = miningSession.connect(signer)
      const difficultyBN = await sessionWithSigner.getDifficulty()
      const difficultyNum = parseInt(difficultyBN.toString())
      setLastDifficulty(difficultyNum)

      const { nonce } = mine(difficultyNum, address)
      setLastNonce(nonce)

      const tx = await sessionWithSigner.submitShare(nonce)
      await tx.wait()
    } catch (e) {
      console.error("Mining error:", e)
      setError(e?.message || "Mining failed")
    } finally {
      setIsMining(false)
    }
  }, [miningSession, signer, address])

  const handleClaim = useCallback(async () => {
    setError(null)
    try {
      await claimRewards()
    } catch (e) {
      console.error("Claim error:", e)
      setError(e?.message || "Failed to claim rewards")
    }
  }, [claimRewards])

  // 🧩 Guard against MetaMask not connected
  if (!isConnected || !signer || !miningSession) {
    return (
      <div style={{ color: "white", padding: "20px", textAlign: "center" }}>
        Please connect MetaMask to start mining.
      </div>
    )
  }

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.1)",
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "12px" }}>
        Mining Panel
      </h2>

      <div style={{ marginBottom: "12px", fontSize: "14px" }}>
        <strong>Wallet:</strong>{" "}
        {isConnected ? (
          <span>{address}</span>
        ) : (
          <span style={{ opacity: 0.8 }}>Not connected</span>
        )}
      </div>

      {!isConnected && (
        <button
          onClick={handleConnect}
          disabled={isPending}
          style={{
            padding: "8px 14px",
            marginBottom: "16px",
            background: "#2563eb",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          {isPending ? "Connecting..." : "Connect Wallet"}
        </button>
      )}

      <div
        style={{
          marginBottom: "16px",
          padding: "10px",
          borderRadius: "8px",
          background: "rgba(255,255,255,0.03)",
          fontSize: "14px",
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          <strong>Pending Rewards:</strong>{" "}
          {pendingRewards !== null ? pendingRewards.toString() : "—"}
          {loadingRewards && (
            <span style={{ marginLeft: 6, opacity: 0.7 }}>(refreshing…)</span>
          )}
        </div>

        <button
          onClick={handleClaim}
          disabled={!isConnected || pendingRewards === null || pendingRewards === 0n}
          style={{
            padding: "6px 10px",
            background: "#16a34a",
            borderRadius: "6px",
            border: "none",
            cursor: !isConnected ? "not-allowed" : "pointer",
            color: "white",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          Claim Rewards
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={startMining}
          disabled={isMining || !isConnected || !miningSession || !signer}
          style={{
            padding: "10px 16px",
            background: "#f97316",
            borderRadius: "8px",
            border: "none",
            cursor: !isConnected ? "not-allowed" : "pointer",
            width: "100%",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {isMining ? "Mining..." : "Start Mining"}
        </button>
      </div>

      {lastNonce !== null && (
        <div style={{ marginTop: "8px", fontSize: "14px" }}>
          <strong>Last Nonce:</strong> {lastNonce}
        </div>
      )}

      {lastDifficulty !== null && (
        <div style={{ marginTop: "4px", fontSize: "14px" }}>
          <strong>Last Difficulty:</strong> {lastDifficulty}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px",
            borderRadius: "6px",
            background: "rgba(239,68,68,0.12)",
            color: "#fecaca",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
