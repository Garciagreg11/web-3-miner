// src/wagmi.ts

import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'

// ABIs
import miningSessionAbi from './abi/MiningSession.json'
import rewardsVaultAbi from './abi/RewardsVault.json'

// Contracts
export const miningSessionContract = {
  address: '0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA',
  abi: miningSessionAbi,
} as const

export const rewardsVaultContract = {
  address: '0x26dc721817A5D325A7dE958d4861bF8e3bC331e6',
  abi: rewardsVaultAbi,
} as const

// REQUIRED: Wagmi config (this is what main.tsx imports)
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.base.org") // Using a reliable public RPC to bypass custom proxy issues
  },
});

