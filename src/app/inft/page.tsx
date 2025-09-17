'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { INFTGrid } from '@/components/inft/INFTGrid'
import { PageHeader } from '@/components/ui/page-header'
import { ConnectWallet } from '@/components/wallet/connect-wallet'
import { useINFT } from '@/hooks/useINFT'

export default function INFTPage() {
  const { isConnected } = useAccount()
  const { infts, loading, transferINFT, authorizeINFT, useAgent } = useINFT()
  const [transferTo, setTransferTo] = useState('')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)

  // Handle transfer
  const handleTransfer = (tokenId: number) => {
    setSelectedTokenId(tokenId)
    setShowTransferModal(true)
  }

  // Handle authorization
  const handleAuthorize = async (tokenId: number) => {
    // In a real implementation, we would show a modal to select the executor address
    const executor = '0x1234567890123456789012345678901234567890'
    await authorizeINFT(tokenId, executor)
  }

  // Handle using the agent
  const handleUse = async (tokenId: number) => {
    await useAgent(tokenId)
    // In a real implementation, this would redirect to a usage page or show a modal
    alert(`Using INFT agent with ID: ${tokenId}`)
  }

  // Complete transfer
  const completeTransfer = async () => {
    if (selectedTokenId !== null && transferTo) {
      await transferINFT(selectedTokenId, transferTo)
      setShowTransferModal(false)
      setTransferTo('')
      setSelectedTokenId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          title="Intelligent NFTs"
          description="Browse, transfer, and authorize your intelligent NFT agents"
        />
        <div className="flex-shrink-0">
          <ConnectWallet />
        </div>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-gray-800 shadow-lg">
          <div className="text-7xl mb-6">🤖</div>
          <h3 className="text-2xl font-semibold text-white mb-3">
            Connect Your Wallet to Access Your AI Agents
          </h3>
          <p className="text-gray-400 max-w-lg mb-8 text-lg">
            Your intelligent NFTs are waiting. Connect your wallet to view, manage, and deploy your AI agents.
          </p>
          <div className="animate-pulse">
            <ConnectWallet />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-800/30 rounded-lg">
            <h3 className="text-lg font-medium text-indigo-300 mb-2">Your AI Agent Collection</h3>
            <p className="text-gray-400">
              These intelligent NFTs represent AI agents you own and can authorize for use by others.
            </p>
          </div>
          
          <INFTGrid
            infts={infts}
            onTransfer={handleTransfer}
            onAuthorize={handleAuthorize}
            onUse={handleUse}
            loading={loading}
          />
          
          {/* Enhanced Transfer Modal */}
          {showTransferModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-2">Transfer AI Agent</h3>
                <p className="text-gray-400 mb-6 pb-2 border-b border-gray-800">
                  Enter the wallet address of the recipient to transfer INFT #{selectedTokenId}
                </p>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-3 mb-6 bg-gray-800/70 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={completeTransfer}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!transferTo}
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}