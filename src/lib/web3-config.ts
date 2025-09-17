import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { http } from 'wagmi'
import { defineChain } from 'viem'

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required. Get your project ID from https://cloud.walletconnect.com')
}

// Load RPC and Chain ID from env with sane defaults
const RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai'
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID || 16601)

// Define 0G Galileo Testnet using env-configurable values
export const zgGalileoTestnet = defineChain({
  id: CHAIN_ID,
  name: '0G Galileo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
})

// App metadata
const metadata = {
  name: '0G Labs AI Inference',
  description: 'Decentralized AI inference powered by 0G Network',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmi config
export const config = defaultWagmiConfig({
  chains: [zgGalileoTestnet],
  projectId,
  metadata,
  transports: {
    [zgGalileoTestnet.id]: http(RPC_URL)
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true
})

// Create Web3Modal
export const modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#FFD700',
    '--w3m-color-mix-strength': 20
  }
})