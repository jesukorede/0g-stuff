import React from 'react';
import { INFTCard } from './INFTCard';

interface INFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  agentType: string;
  owner: string;
  isAuthorized: boolean;
}

interface INFTGridProps {
  infts: INFT[];
  onTransfer?: (tokenId: number) => void;
  onAuthorize?: (tokenId: number) => void;
  onUse?: (tokenId: number) => void;
  loading?: boolean;
}

export const INFTGrid: React.FC<INFTGridProps> = ({
  infts,
  onTransfer,
  onAuthorize,
  onUse,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (infts.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No INFTs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {infts.map((inft) => (
        <INFTCard
          key={inft.tokenId}
          tokenId={inft.tokenId}
          name={inft.name}
          description={inft.description}
          image={inft.image}
          agentType={inft.agentType}
          owner={inft.owner}
          isAuthorized={inft.isAuthorized}
          onTransfer={onTransfer}
          onAuthorize={onAuthorize}
          onUse={onUse}
        />
      ))}
    </div>
  );
};