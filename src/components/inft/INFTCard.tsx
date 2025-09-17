import React, { useState } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { Shield, Send, ArrowUpRight, Info } from 'lucide-react';

interface INFTCardProps {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  agentType: string;
  owner: string;
  isAuthorized: boolean;
  onTransfer?: (tokenId: number) => void;
  onAuthorize?: (tokenId: number) => void;
  onUse?: (tokenId: number) => void;
}

export const INFTCard: React.FC<INFTCardProps> = ({
  tokenId,
  name,
  description,
  image,
  agentType,
  owner,
  isAuthorized,
  onTransfer,
  onAuthorize,
  onUse,
}) => {
  const { address } = useAccount();
  const isOwner = address?.toLowerCase() === owner.toLowerCase();
  const [showDetails, setShowDetails] = useState(false);

  // Truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get agent type icon
  const getAgentTypeIcon = () => {
    switch (agentType.toLowerCase()) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🔊';
      case 'video':
        return '🎬';
      default:
        return '🤖';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 group">
      {/* Card Header with Image */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-indigo-900/50 to-purple-900/30">
        {image ? (
          <div className="relative h-full w-full">
            <Image 
              src={image} 
              alt={name} 
              fill 
              className="object-cover opacity-80 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100" 
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20">
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {getAgentTypeIcon()}
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent p-4 pt-12">
          <h3 className="text-xl font-semibold text-white">{name}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-indigo-900/30 px-2.5 py-1 text-xs font-medium text-indigo-300 border border-indigo-800/30">
              #{tokenId}
            </span>
            <span className="rounded-full bg-purple-900/30 px-2.5 py-1 text-xs font-medium text-purple-300 border border-purple-800/30">
              {agentType}
            </span>
          </div>
          {isAuthorized && (
            <span className="flex items-center space-x-1 rounded-full bg-green-900/30 px-2.5 py-1 text-xs font-medium text-green-300 border border-green-800/30">
              <Shield className="h-3 w-3" />
              <span>Authorized</span>
            </span>
          )}
        </div>

        <p className="mb-5 text-sm text-gray-400 line-clamp-2 min-h-[40px]">
          {description}
        </p>

        {/* Details Section (Expandable) */}
        {showDetails && (
          <div className="mb-4 rounded-lg bg-gray-800/50 p-3 text-xs text-gray-300">
            <div className="mb-2">
              <span className="font-medium text-gray-400">Owner: </span>
              <span className="font-mono bg-gray-800/50 px-1.5 py-0.5 rounded">{truncateAddress(owner)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-400">Token ID: </span>
              <span>{tokenId}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Info className="h-3 w-3" />
            <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
          </button>

          <div className="flex items-center space-x-3">
            {isOwner && onTransfer && (
              <button
                onClick={() => onTransfer(tokenId)}
                className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-2.5 py-1.5 text-xs font-medium text-white hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-sm shadow-indigo-900/20"
              >
                <Send className="h-3 w-3" />
                <span>Transfer</span>
              </button>
            )}
            
            {isOwner && onAuthorize && (
              <button
                onClick={() => onAuthorize(tokenId)}
                className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-2.5 py-1.5 text-xs font-medium text-white hover:from-purple-500 hover:to-purple-600 transition-all shadow-sm shadow-purple-900/20"
              >
                <Shield className="h-3 w-3" />
                <span>Authorize</span>
              </button>
            )}
            
            {isAuthorized && onUse && (
              <button
                onClick={() => onUse(tokenId)}
                className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-2.5 py-1.5 text-xs font-medium text-white hover:from-green-500 hover:to-green-600 transition-all shadow-sm shadow-green-900/20"
              >
                <ArrowUpRight className="h-3 w-3" />
                <span>Use Agent</span>
              </button>
            )}
            
            {!isAuthorized && !isOwner && (
              <div className="flex items-center space-x-1 rounded-lg bg-gray-800 px-2 py-1 text-xs font-medium text-gray-400">
                <Shield className="h-3 w-3" />
                <span>Not Authorized</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};