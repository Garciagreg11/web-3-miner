import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useState, useEffect } from 'react'
import { parseEther } from 'viem'

// 1. Your deployed Pool/Miner Contract Address containing the claim split routine
const MINER_POOL_CONTRACT = '0x6C5549B0b531002713c84320dd82A47e87FFDAC8'

// 2. Verified Contract ABI for handling the single-click on-chain distribution split
const MINER_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "totalAmount", "type": "uint256" }
    ],
    "name": "claimMinerRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

function App() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId() // Extracts the correct active chain ID dynamically
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()

  // Wagmi live chain state interaction hooks
  const { writeContract, data: hash, error: contractError, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Simulation, Rig, and Mining States
  const [isMining, setIsMining] = useState(false)
  const [shares, setShares] = useState(0)
  const [pendingGG72, setPendingGG72] = useState(0)
  const [difficulty] = useState('2.10 T')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulation Loop: Emulating GPU block hashing math
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isMining) {
      interval = setInterval(() => {
        setShares((prev) => prev + 1)
        setPendingGG72((prev) => prev + 0.5) // Increments claimable balance by 0.5 tokens per block share
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [isMining])

  const handleRefreshRewards = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  // Automated Token Splitting Trigger Routine
  const handleClaim = () => {
    if (pendingGG72 === 0) return alert("You don't have any pending GG72 to claim!")
    if (!address) return alert("Please connect your wallet first!")

    // Executes the on-chain call passing the raw total amount accumulated
    writeContract({
      address: MINER_POOL_CONTRACT,
      abi: MINER_CONTRACT_ABI,
      functionName: 'claimMinerRewards',
      args: [parseEther(pendingGG72.toFixed(4).toString())],
      chainId: chainId, // Bypasses internal connector.getChainId() error by passing it explicitly
    })

    console.log(`[Protocol Audit] Initiated on-chain split claim for total: ${pendingGG72} GG72`)
  }

  return (
    <div style={{
      backgroundColor: '#070709',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      {isConnected ? (
        <div style={{
          width: '100%',
          maxWidth: '680px',
          padding: '32px',
          background: '#111115',
          borderRadius: '20px',
          border: '1px solid #1e1e24',
          boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
          boxSizing: 'border-box'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ffcc', boxShadow: '0 0 8px #00ffcc' }}></span>
              <h1 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '20px', letterSpacing: '-0.5px' }}>web-3 miner</h1>
            </div>
            <button
              onClick={() => disconnect()}
              style={{ background: '#1c1c24', color: '#a1a1aa', border: '1px solid #27273a', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}
            >
              Disconnect
            </button>
          </div>

          {/* Subheader Network & Identity Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <p style={{ color: '#71717a', margin: 0, fontSize: '13px' }}>
              Identity: <span style={{ color: '#00ffcc', fontFamily: 'monospace', background: '#181820', padding: '3px 8px', borderRadius: '4px', border: '1px solid #272732' }}>{address?.slice(0,6)}...{address?.slice(-4)}</span>
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 500, color: '#71717a' }}>
              <span style={{ color: '#38bdf8' }}>🌐 Base Mainnet</span>
              <span>•</span>
              <span>⛽ Standard Gas</span>
            </div>
          </div>

          {/* Performance Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#161620', padding: '18px', borderRadius: '12px', border: '1px solid #222230' }}>
              <h3 style={{ color: '#71717a', margin: '0 0 6px 0', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hash Rate</h3>
              <p style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: isMining ? '#00ffcc' : '#ef4444', transition: 'color 0.3s' }}>
                {isMining ? '45.2 MH/s' : '0.0 MH/s'}
              </p>
            </div>

            <div style={{ background: '#161620', padding: '18px', borderRadius: '12px', border: '1px solid #222230' }}>
              <h3 style={{ color: '#71717a', margin: '0 0 6px 0', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hardware Status</h3>
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: '#f4f4f5', paddingTop: '8px' }}>
                GPU Direct Access <span style={{ color: '#a78bfa', fontSize: '12px' }}>(WSL2)</span>
              </p>
            </div>

            <div style={{ background: '#161620', padding: '18px', borderRadius: '12px', border: '1px solid #222230' }}>
              <h3 style={{ color: '#71717a', margin: '0 0 6px 0', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Network Difficulty</h3>
              <p style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#f4f4f5' }}>{difficulty}</p>
            </div>

            <div style={{ background: '#161620', padding: '18px', borderRadius: '12px', border: '1px solid #222230' }}>
              <h3 style={{ color: '#71717a', margin: '0 0 6px 0', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shares Accepted</h3>
              <p style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: shares > 0 ? '#00ffcc' : '#71717a' }}>
                {shares} <span style={{ fontSize: '13px', color: '#52525b', fontWeight: 500 }}>valid</span>
              </p>
            </div>
          </div>

          {/* Rewards Card */}
          <div style={{
            background: '#161224',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #3c245c',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h4 style={{ color: '#c084fc', margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                ⏳ Pending Balance
              </h4>
              <p style={{ fontSize: '36px', fontWeight: 800, margin: 0, color: '#ffffff', tracking: '-1px' }}>
                {pendingGG72.toFixed(2)} <span style={{ fontSize: '16px', color: '#c084fc', fontWeight: 500 }}>GG72</span>
              </p>
              <span style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '4px' }}>
                🛡️ On-chain automated 1% fee split active for ecosystem sustainability.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRefreshRewards}
                disabled={isRefreshing}
                style={{
                  padding: '12px 18px',
                  fontWeight: 600,
                  fontSize: '14px',
                  background: '#1c1c24',
                  color: '#f4f4f5',
                  border: '1px solid #2d2d3d',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  opacity: isRefreshing ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isRefreshing ? '🔄 Checking...' : '🔄 Refresh'}
              </button>

              <button
                onClick={handleClaim}
                disabled={pendingGG72 === 0 || isPending || isConfirming}
                style={{
                  padding: '12px 22px',
                  fontWeight: 700,
                  fontSize: '14px',
                  background: '#a855f7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: pendingGG72 > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: pendingGG72 > 0 ? '0 0 20px rgba(168, 85, 247, 0.4)' : 'none',
                  opacity: (pendingGG72 === 0 || isPending || isConfirming) ? 0.4 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : '💰 Single-Click Claim'}
              </button>
            </div>
          </div>

          {/* Master Toggle */}
          <button
            onClick={() => {
              setIsMining(!isMining);
              if (!isMining) {
                setShares(0);
                setPendingGG72(0);
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              fontWeight: 700,
              fontSize: '15px',
              background: isMining ? '#ef4444' : '#00ffcc',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: isMining ? 'none' : '0 0 15px rgba(0, 255, 204, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            {isMining ? '🛑 Stop Hardware Miner' : '⚡ Start Hardware Miner'}
          </button>

          {/* Transaction Receipt Status Elements */}
          {isSuccess && (
            <div style={{ background: 'rgba(0, 255, 204, 0.06)', border: '1px solid rgba(0, 255, 204, 0.2)', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
              <p style={{ color: '#00ffcc', textAlign: 'center', margin: 0, fontSize: '13px', fontWeight: 500 }}>
                🎉 Success! Split rewards safely distributed on-chain in a single block.
              </p>
            </div>
          )}
          {contractError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
              <p style={{ color: '#ef4444', textAlign: 'center', margin: 0, fontSize: '13px', fontWeight: 500 }}>
                ❌ Settlement Error: {contractError.message.slice(0, 55)}...
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a
              href="https://explorer.zora.energy/token/0x1702eb4751e66f0617840c182556d4b92e122b5c"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '11px', color: '#52525b', textDecoration: 'none', fontWeight: 500, display: 'block', textAlign: 'center' }}
            >
              Examine GG72 Contract Liquidity Asset Vector ↗
            </a>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '36px',
          background: '#111115',
          borderRadius: '20px',
          border: '1px solid #1e1e24',
          maxWidth: '380px',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#fff' }}>Web3 Miner Protocol</h2>
          <p style={{ color: '#71717a', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px', padding: '0 10px' }}>
            Establish a browser handshake with your local hardware components to verify cryptographic blocks.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                style={{ width: '100%', padding: '14px', background: '#00ffcc', color: '#000', border: 'none', fontWeight: 700, borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}
              >
                Connect with {connector.name}
              </button>
            ))}
          </div>
          {connectError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>{connectError.message}</p>}
        </div>
      )}
    </div>
  )
}

export default App
