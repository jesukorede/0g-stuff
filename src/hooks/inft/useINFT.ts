import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
import { MetadataManager } from '../../services/inft/MetadataManager';
import { INFT_ABI } from '../../types/inft/abi';

// Remove the empty ABI placeholder
// const INFT_ABI = [/* ABI would go here */];

interface INFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  agentType: string;
  owner: string;
  isAuthorized: boolean;
}

export function useINFT(contractAddress: string) {
  const { address } = useAccount();
  const [infts, setInfts] = useState<INFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { data: writeData, isPending, writeContract } = useWriteContract();

  // Example read function using wagmi's useReadContract
  const { data: totalSupply } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: INFT_ABI,
    functionName: 'totalSupply',
  });

  // Fetch all INFTs owned by the current user
  const fetchMyINFTs = useCallback(async () => {
    if (!address || !contractAddress) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, you would query the contract for tokens owned by the user
      // For this example, we'll use mock data
      const mockINFTs: INFT[] = [
        {
          tokenId: 1,
          name: 'Text Generation Agent',
          description: 'An AI agent specialized in generating creative text content',
          image: 'https://example.com/text-agent.jpg',
          agentType: 'text',
          owner: address,
          isAuthorized: true,
        },
        {
          tokenId: 2,
          name: 'Image Analysis Agent',
          description: 'An AI agent that can analyze and describe images',
          image: 'https://example.com/image-agent.jpg',
          agentType: 'image',
          owner: address,
          isAuthorized: true,
        },
      ];
      
      setInfts(mockINFTs);
      setError(null);
    } catch (err) {
      console.error('Error fetching INFTs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching INFTs'));
    } finally {
      setLoading(false);
    }
  }, [address, contractAddress]);

  // Mint a new INFT
  const mintINFT = useCallback(async (metadata: any) => {
    if (!address || !contractAddress) return;
    
    try {
      // In a real implementation, you would:
      // 1. Create and encrypt the metadata
      // 2. Upload to IPFS
      // 3. Call the mint function on the contract
      
      // For this example, we'll just simulate the contract call
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: INFT_ABI,
        functionName: 'mint',
        args: [
          address,
          Date.now(), // Using timestamp as a simple tokenId
          'ipfs://QmExample', // Simulated IPFS URI
          'encryptedKey', // Simulated encrypted key
          metadata.agentType,
        ],
      });
      
      // After successful mint, refresh the list
      await fetchMyINFTs();
      
      return true;
    } catch (err) {
      console.error('Error minting INFT:', err);
      throw err;
    }
  }, [address, contractAddress, writeContract, fetchMyINFTs]);

  // Transfer an INFT to another address
  const transferINFT = useCallback(async (tokenId: number, toAddress: string) => {
    if (!address || !contractAddress) return;
    
    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: INFT_ABI,
        functionName: 'transferFrom',
        args: [address, toAddress, tokenId],
      });
      
      // After successful transfer, refresh the list
      await fetchMyINFTs();
      
      return true;
    } catch (err) {
      console.error('Error transferring INFT:', err);
      throw err;
    }
  }, [address, contractAddress, writeContract, fetchMyINFTs]);

  // Authorize a user to use an INFT
  const authorizeUser = useCallback(async (tokenId: number, userAddress: string) => {
    if (!address || !contractAddress) return;
    
    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: INFT_ABI,
        functionName: 'grantAuthorization',
        args: [tokenId, userAddress],
      });
      
      return true;
    } catch (err) {
      console.error('Error authorizing user:', err);
      throw err;
    }
  }, [address, contractAddress, writeContract]);

  // Load INFTs on component mount or when address/contract changes
  useEffect(() => {
    fetchMyINFTs();
  }, [fetchMyINFTs]);

  return {
    infts,
    loading,
    error,
    mintINFT,
    transferINFT,
    authorizeUser,
    isPending,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
  };
}