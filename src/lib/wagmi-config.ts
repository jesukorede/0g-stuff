import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, base, optimism } from 'wagmi/chains'

// Get projectId from environment - REQUIRED for production
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required. Get your project ID from https://cloud.walletconnect.com')
}

// Define 0G testnet chain
const zgTestnet = {
  id: 16601,
  name: '0G Galileo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
} as const

const metadata = {
  name: '0G Labs Inference Client',
  description: 'Decentralized AI Inference with Multiple Wallet Support',
  url: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig for production
const chains = [zgTestnet, mainnet, sepolia, polygon, arbitrum, base, optimism] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})