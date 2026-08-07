import { type Address } from 'viem'
import { base, baseSepolia } from 'wagmi/chains'

export const CONTRACTS = {
  // Base Mainnet (Chain ID 8453)
  [base.id]: {
    gg72Token: (import.meta.env.VITE_GG72_TOKEN_ADDRESS ||
      '0xf150e8f60d21D3C07066348f717b3B2e6E2dEd9c') as Address,
    miningSession: (import.meta.env.VITE_MINING_SESSION_ADDRESS ||
      '0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA') as Address,
    rewardsVault: (import.meta.env.VITE_REWARDS_VAULT_ADDRESS ||
      '0x26dc721817A5D325A7dE958d4861bF8e3bC331e6') as Address,
  },
  // Base Sepolia Testnet (Chain ID 84532)
  [baseSepolia.id]: {
    gg72Token: (import.meta.env.VITE_SEPOLIA_GG72_TOKEN_ADDRESS ||
      '0x0000000000000000000000000000000000000000') as Address,
    miningSession: (import.meta.env.VITE_SEPOLIA_MINING_SESSION_ADDRESS ||
      '0x0000000000000000000000000000000000000000') as Address,
    rewardsVault: (import.meta.env.VITE_SEPOLIA_REWARDS_VAULT_ADDRESS ||
      '0x0000000000000000000000000000000000000000') as Address,
  },
} as const
