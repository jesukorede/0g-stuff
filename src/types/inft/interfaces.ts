import { ContractTransactionResponse } from 'ethers';

export interface TransferProof {
  sealedKey: Uint8Array;
  proof: Uint8Array;
  newMetadataHash: string;
  newEncryptedURI?: string;
}

export interface MintResult {
  tokenId: bigint;
  sealedKey: Uint8Array;
  transactionHash: string;
}

export interface AuthorizationPermissions {
  canExecute: boolean;
  canTransfer: boolean;
  expiresAt: bigint;
}

export interface INFTFunctions {
  balanceOf(owner: string): Promise<bigint>;
  ownerOf(tokenId: bigint): Promise<string>;
  transferFrom(from: string, to: string, tokenId: bigint): Promise<ContractTransactionResponse>;
  
  // INFT specific functions
  mint(to: string, encryptedURI: string, metadataHash: string): Promise<ContractTransactionResponse>;
  transfer(from: string, to: string, tokenId: bigint, sealedKey: Uint8Array, proof: Uint8Array): Promise<ContractTransactionResponse>;
  authorizeUsage(tokenId: bigint, executor: string, permissions: Uint8Array): Promise<ContractTransactionResponse>;
  getMetadataHash(tokenId: bigint): Promise<string>;
  getEncryptedURI(tokenId: bigint): Promise<string>;
}

export interface IOracleFunctions {
  verifyProof(proof: Uint8Array): Promise<boolean>;
}