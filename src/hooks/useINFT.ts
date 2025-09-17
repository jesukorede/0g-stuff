'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { INFT_ABI } from '@/constants/abis'
import { INFT_CONTRACT_ADDRESS } from '@/constants/addresses'
import { INFTMetadata } from '@/types/inft'

export function useINFT() {
  const { address, isConnected } = useAccount()
  const [infts, setInfts] = useState<INFTMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const { writeContractAsync } = useWriteContract()

  // Sample data for testing
  const sampleINFTs = [
    {
      tokenId: 1,
      name: 'Text Generation Agent',
      description: 'An AI agent specialized in generating creative text content.',
      image: '',
      agentType: 'Text',
      owner: address || '0x0000000000000000000000000000000000000000',
      isAuthorized: true,
    },
    {
      tokenId: 2,
      name: 'Image Creation Agent',
      description: 'An AI agent that creates stunning visual artwork and images.',
      image: '',
      agentType: 'Image',
      owner: address || '0x0000000000000000000000000000000000000000',
      isAuthorized: false,
    },
    {
      tokenId: 3,
      name: 'Code Assistant',
      description: 'An AI agent that helps with programming and code generation.',
      image: '',
      agentType: 'Text',
      owner: '0x1234567890123456789012345678901234567890',
      isAuthorized: false,
    },
  ]

  // Function to use an agent
  const useAgent = async (tokenId: number) => {
    // Implementation for using an agent
    console.log(`Using agent with token ID: ${tokenId}`);
    return true;
  };

  // Load INFTs
  useEffect(() => {
    const fetchINFTs = async () => {
      setLoading(true)
      try {
        // In a real implementation, this would fetch data from the blockchain
        // For now, we'll use sample data
        setTimeout(() => {
          setInfts(sampleINFTs)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching INFTs:', error)
        setLoading(false)
      }
    }

    if (isConnected) {
      fetchINFTs()
    } else {
      setInfts([])
      setLoading(false)
    }
  }, [address, isConnected])

  // Transfer INFT
  const transferINFT = async (tokenId: number, to: string) => {
    if (!isConnected || !address) return false
    
    try {
      // In a real implementation, this would call the contract
      console.log(`Transferring INFT ${tokenId} to ${to}`)
      
      // Update local state to reflect the transfer
      setInfts(prev => 
        prev.map(inft => 
          inft.tokenId === tokenId 
            ? { ...inft, owner: to } 
            : inft
        )
      )
      
      return true
    } catch (error) {
      console.error('Error transferring INFT:', error)
      return false
    }
  }

  // Authorize INFT
  const authorizeINFT = async (tokenId: number, executor: string) => {
    if (!isConnected || !address) return false
    
    try {
      // In a real implementation, this would call the contract
      console.log(`Authorizing INFT ${tokenId} for ${executor}`)
      
      // Update local state to reflect the authorization
      setInfts(prev => 
        prev.map(inft => 
          inft.tokenId === tokenId 
            ? { ...inft, isAuthorized: true } 
            : inft
        )
      )
      
      return true
    } catch (error) {
      console.error('Error authorizing INFT:', error)
      return false
    }
  }

  // Use INFT
  const useINFT = async (tokenId: number) => {
    if (!isConnected || !address) return false
    
    try {
      // In a real implementation, this would call the contract or API
      console.log(`Using INFT ${tokenId}`)
      return true
    } catch (error) {
      console.error('Error using INFT:', error)
      return false
    }
  }

  return {
    infts,
    loading,
    transferINFT,
    authorizeINFT,
    useINFT,
    useAgent
  }
}