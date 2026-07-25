import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
})

export const MINER_CONTRACT_ADDRESS = '0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA' as const;
