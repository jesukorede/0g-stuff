import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

interface AgentMetadata {
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

export class MetadataManager {
  private encryptionKey: string;
  private ipfsGateway: string;

  constructor(encryptionKey: string, ipfsGateway: string = 'https://ipfs.io/ipfs/') {
    this.encryptionKey = encryptionKey;
    this.ipfsGateway = ipfsGateway;
  }

  /**
   * Creates metadata for a new AI agent
   */
  public createAgentMetadata(params: Partial<AgentMetadata>): AgentMetadata {
    const metadata: AgentMetadata = {
      name: params.name || 'Unnamed Agent',
      description: params.description || 'An AI agent on the 0G network',
      image: params.image || '',
      agentType: params.agentType || 'general',
      capabilities: params.capabilities || [],
      parameters: params.parameters || {},
      modelId: params.modelId || '',
      version: params.version || '1.0.0',
      creator: params.creator || '',
      createdAt: params.createdAt || Date.now(),
    };

    return metadata;
  }

  /**
   * Encrypts agent metadata using the encryption key
   */
  public encryptMetadata(metadata: AgentMetadata): string {
    const metadataString = JSON.stringify(metadata);
    return CryptoJS.AES.encrypt(metadataString, this.encryptionKey).toString();
  }

  /**
   * Decrypts agent metadata using the encryption key
   */
  public decryptMetadata(encryptedMetadata: string): AgentMetadata {
    const bytes = CryptoJS.AES.decrypt(encryptedMetadata, this.encryptionKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString) as AgentMetadata;
  }

  /**
   * Encrypts the metadata key with the recipient's public key
   */
  public encryptMetadataKeyForRecipient(recipientPublicKey: string): string {
    // In a real implementation, this would use asymmetric encryption
    // For simplicity, we're using a hash-based approach here
    const combinedKey = this.encryptionKey + recipientPublicKey;
    return CryptoJS.SHA256(combinedKey).toString();
  }

  /**
   * Prepares metadata for minting an INFT
   */
  public async prepareForMinting(
    metadata: AgentMetadata,
    ownerPublicKey: string
  ): Promise<{
    tokenURI: string;
    encryptedMetadataKey: string;
    agentType: string;
  }> {
    // In a production environment, you would upload to IPFS
    // For this implementation, we'll simulate an IPFS CID
    const metadataHash = CryptoJS.SHA256(JSON.stringify(metadata)).toString();
    const simulatedCID = `Qm${metadataHash.substring(0, 44)}`;
    const tokenURI = `${this.ipfsGateway}${simulatedCID}`;
    
    // Encrypt the metadata key for the owner
    const encryptedMetadataKey = this.encryptMetadataKeyForRecipient(ownerPublicKey);
    
    return {
      tokenURI,
      encryptedMetadataKey,
      agentType: metadata.agentType,
    };
  }
}