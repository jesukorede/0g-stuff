declare module 'inft' {
  import { InterfaceAbi } from 'ethers';

  export interface INFTContract {
    balanceOf(owner: string): Promise<bigint>;
    ownerOf(tokenId: number): Promise<string>;
    safeTransferFrom(from: string, to: string, tokenId: number): Promise<void>;
    transferFrom(from: string, to: string, tokenId: number): Promise<void>;
    approve(to: string, tokenId: number): Promise<void>;
    getApproved(tokenId: number): Promise<string>;
    setApprovalForAll(operator: string, approved: boolean): Promise<void>;
    isApprovedForAll(owner: string, operator: string): Promise<boolean>;
    tokenURI(tokenId: number): Promise<string>;
    totalSupply(): Promise<bigint>;
    mint(to: string, tokenId: number, tokenURI: string, encryptedMetadataKey: string, agentType: string): Promise<void>;
    batchMint(to: string[], tokenIds: number[], tokenURIs: string[], encryptedMetadataKeys: string[], agentTypes: string[]): Promise<void>;
    grantAuthorization(tokenId: number, user: string): Promise<void>;
    revokeAuthorization(tokenId: number, user: string): Promise<void>;
    isAuthorized(tokenId: number, user: string): Promise<boolean>;
    updateMetadata(tokenId: number, newTokenURI: string, newEncryptedMetadataKey: string): Promise<void>;
    getEncryptedMetadataKey(tokenId: number): Promise<string>;
    getAgentType(tokenId: number): Promise<string>;
    setOracleAddress(oracleAddress: string): Promise<void>;
    oracleAddress(): Promise<string>;
  }

  export interface OracleContract {
    authorizeRequest(requester: string, tokenId: number, timestamp: number): Promise<string>;
    executeRequest(requestId: string): Promise<boolean>;
    authorizedRequests(requestId: string): Promise<boolean>;
  }
}
