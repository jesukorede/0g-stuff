// Type definitions for INFT
// Project: 0g-inference
// Definitions by: chizzyedoka

/// <reference types="node" />

import { InterfaceAbi, ContractTransactionResponse } from 'ethers';

declare module '@0g/inft' {
  export interface INFTContract {
    balanceOf(owner: string): Promise<bigint>;
    ownerOf(tokenId: number): Promise<string>;
    safeTransferFrom(from: string, to: string, tokenId: number): Promise<ContractTransactionResponse>;
    transferFrom(from: string, to: string, tokenId: number): Promise<ContractTransactionResponse>;
    approve(to: string, tokenId: number): Promise<ContractTransactionResponse>;
    getApproved(tokenId: number): Promise<string>;
    setApprovalForAll(operator: string, approved: boolean): Promise<ContractTransactionResponse>;
    isApprovedForAll(owner: string, operator: string): Promise<boolean>;
    tokenURI(tokenId: number): Promise<string>;
    totalSupply(): Promise<bigint>;
    mint(to: string, tokenId: number, tokenURI: string, encryptedMetadataKey: string, agentType: string): Promise<ContractTransactionResponse>;
    batchMint(to: string[], tokenIds: number[], tokenURIs: string[], encryptedMetadataKeys: string[], agentTypes: string[]): Promise<ContractTransactionResponse>;
    grantAuthorization(tokenId: number, user: string): Promise<ContractTransactionResponse>;
    revokeAuthorization(tokenId: number, user: string): Promise<ContractTransactionResponse>;
    isAuthorized(tokenId: number, user: string): Promise<boolean>;
    updateMetadata(tokenId: number, newTokenURI: string, newEncryptedMetadataKey: string): Promise<ContractTransactionResponse>;
    getEncryptedMetadataKey(tokenId: number): Promise<string>;
    getAgentType(tokenId: number): Promise<string>;
    setOracleAddress(oracleAddress: string): Promise<ContractTransactionResponse>;
    oracleAddress(): Promise<string>;
  }

  export interface OracleContract {
    authorizeRequest(requester: string, tokenId: number, timestamp: number): Promise<ContractTransactionResponse>;
    executeRequest(requestId: string): Promise<ContractTransactionResponse>;
    authorizedRequests(requestId: string): Promise<boolean>;
  }

  export const INFT_ABI: InterfaceAbi;
  export const ORACLE_ABI: InterfaceAbi;
}
