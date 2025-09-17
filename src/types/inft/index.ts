// INFT Metadata Types
export interface AgentMetadata {
  name: string;
  description: string;
  image: string;
  agentType: string;
  capabilities: string[];
  parameters: Record<string, any>;
  modelId: string;
  version: string;
  creator: string;
  createdAt: number;
}

// INFT Types
export interface INFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  agentType: string;
  owner: string;
  isAuthorized: boolean;
  tokenURI?: string;
  encryptedMetadataKey?: string;
}

// INFTMetadata is an alias for INFT to maintain compatibility
export type INFTMetadata = INFT;

// INFT Service Types
export interface MetadataManagerOptions {
  encryptionKey: string;
  ipfsGateway?: string;
}

export interface TransferManagerOptions {
  provider: any;
  inftContractAddress: string;
  inftContractAbi: any;
  oracleContractAddress: string;
  oracleContractAbi: any;
  metadataManager: any;
}

// INFT Component Props
export interface INFTCardProps {
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

export interface INFTGridProps {
  infts: INFT[];
  onTransfer?: (tokenId: number) => void;
  onAuthorize?: (tokenId: number) => void;
  onUse?: (tokenId: number) => void;
  loading?: boolean;
}

export interface INFTMintFormProps {
  onMint: (data: {
    name: string;
    description: string;
    image: string;
    agentType: string;
    capabilities: string[];
    modelId: string;
  }) => Promise<void>;
  isLoading: boolean;
}

// INFT Hook Return Type
export interface UseINFTReturn {
  infts: INFT[];
  loading: boolean;
  error: Error | null;
  mintINFT: (metadata: any) => Promise<boolean | undefined>;
  transferINFT: (tokenId: number, toAddress: string) => Promise<boolean | undefined>;
  authorizeUser: (tokenId: number, userAddress: string) => Promise<boolean | undefined>;
  isPending: boolean;
  totalSupply: number;
}