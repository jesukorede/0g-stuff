// Centralized contracts config
// Reads addresses from environment and re-exports ABIs

export const INFT_ADDRESS = process.env.NEXT_PUBLIC_INFT_ADDRESS as `0x${string}` | undefined
export const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_ORACLE_ADDRESS as `0x${string}` | undefined

if (typeof window !== 'undefined') {
  if (!INFT_ADDRESS) {
    // eslint-disable-next-line no-console
    console.warn('NEXT_PUBLIC_INFT_ADDRESS is not set. Features depending on INFT will be disabled.')
  }
  if (!ORACLE_ADDRESS) {
    // eslint-disable-next-line no-console
    console.warn('NEXT_PUBLIC_ORACLE_ADDRESS is not set. Features depending on Oracle will be limited.')
  }
}

export { INFT_ABI, ORACLE_ABI } from '@/types/inft/abi'
