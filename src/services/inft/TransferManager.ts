import { ethers, Contract, ContractTransactionResponse, JsonRpcProvider, Signer } from 'ethers';
import { MetadataManager } from './MetadataManager';
import { INFT_ABI } from '@/contracts/abis/INFT.json';
import { ORACLE_ABI } from '@/contracts/abis/Oracle.json';

type TypedContract<T> = Contract & T;

interface INFTFunctions {
  getEncryptedMetadataKey: (tokenId: number) => Promise<string>;
  tokenURI: (tokenId: number) => Promise<string>;
  transferFrom: (from: string, to: string, tokenId: number) => Promise<ContractTransactionResponse>;
  updateMetadata: (tokenId: number, tokenURI: string, encryptedMetadataKey: string) => Promise<ContractTransactionResponse>;
  grantAuthorization: (tokenId: number, user: string) => Promise<ContractTransactionResponse>;
  revokeAuthorization: (tokenId: number, user: string) => Promise<ContractTransactionResponse>;
  isAuthorized: (tokenId: number, user: string) => Promise<boolean>;
}

interface IOracleFunctions {
  authorizeRequest: (requester: string, tokenId: number, timestamp: number) => Promise<ContractTransactionResponse>;
}

export class TransferManager {
  private provider: JsonRpcProvider;
  private inftContract: TypedContract<INFTFunctions>;
  private oracleContract: TypedContract<IOracleFunctions>;
  private metadataManager: MetadataManager;

  constructor(
    provider: JsonRpcProvider,
    inftContractAddress: string,
    oracleContractAddress: string,
    metadataManager: MetadataManager
  ) {
    this.provider = provider;
    this.inftContract = new Contract(
      inftContractAddress,
      INFT_ABI,
      provider
    ) as TypedContract<INFTFunctions>;
    this.oracleContract = new Contract(
      oracleContractAddress,
      ORACLE_ABI,
      provider
    ) as TypedContract<IOracleFunctions>;
    this.metadataManager = metadataManager;
  }

  /**
   * Transfers an INFT to a new owner with secure metadata transfer
   */
  public async transferINFT(
    signer: Signer,
    tokenId: number,
    fromAddress: string,
    toAddress: string,
    recipientPublicKey: string
  ): Promise<ContractTransactionResponse> {
    // Connect contracts with signer
    const inftWithSigner = this.inftContract.connect(signer) as TypedContract<INFTFunctions>;
    
    // Get the current encrypted metadata key
    const encryptedMetadataKey = await inftWithSigner.getEncryptedMetadataKey(tokenId);
    
    // Get the token URI
    const tokenURI = await inftWithSigner.tokenURI(tokenId);
    
    // Re-encrypt the metadata key for the new owner
    const newEncryptedMetadataKey = this.metadataManager.encryptMetadataKeyForRecipient(recipientPublicKey);
    
    // Transfer the token
    const tx = await inftWithSigner.transferFrom(fromAddress, toAddress, tokenId);
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    // Update the metadata key for the new owner
    await inftWithSigner.updateMetadata(tokenId, tokenURI, newEncryptedMetadataKey);
    
    return tx;
  }

  /**
   * Authorizes a user to access an INFT
   */
  public async authorizeUser(
    signer: Signer,
    tokenId: number,
    userAddress: string
  ): Promise<ContractTransactionResponse> {
    const inftWithSigner = this.inftContract.connect(signer) as TypedContract<INFTFunctions>;
    return inftWithSigner.grantAuthorization(tokenId, userAddress);
  }

  /**
   * Revokes authorization from a user
   */
  public async revokeAuthorization(
    signer: Signer,
    tokenId: number,
    userAddress: string
  ): Promise<ContractTransactionResponse> {
    const inftWithSigner = this.inftContract.connect(signer) as TypedContract<INFTFunctions>;
    return inftWithSigner.revokeAuthorization(tokenId, userAddress);
  }

  /**
   * Checks if a user is authorized to access an INFT
   */
  public async isAuthorized(tokenId: number, userAddress: string): Promise<boolean> {
    return this.inftContract.isAuthorized(tokenId, userAddress);
  }

  /**
   * Requests authorization from the oracle for inference
   */
  public async requestInferenceAuthorization(
    signer: Signer,
    tokenId: number,
    requesterAddress: string
  ): Promise<string> {
    const oracleWithSigner = this.oracleContract.connect(signer) as TypedContract<IOracleFunctions>;
    const timestamp = Math.floor(Date.now() / 1000);
    
    const tx = await oracleWithSigner.authorizeRequest(requesterAddress, tokenId, timestamp);
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Transaction failed");
    }
    
    // Extract the requestId from the event logs
    const event = receipt.logs.find(
      (log: any) => log.topics[0] === ethers.id("RequestAuthorized(bytes32,address,uint256)")
    );
    
    if (!event) {
      throw new Error("Failed to find RequestAuthorized event");
    }
    
    const requestId = event.topics[1];
    return requestId;
  }
}
