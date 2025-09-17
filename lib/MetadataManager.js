const { ethers } = require('ethers');
const crypto = require('crypto');

class MetadataManager {
    constructor(ogStorage, encryptionService) {
        this.storage = ogStorage;
        this.encryption = encryptionService;
    }
    
    async createAIAgent(aiModelData, ownerPublicKey) {
        try {
            // Prepare AI agent metadata
            const metadata = {
                model: aiModelData.model,
                weights: aiModelData.weights,
                config: aiModelData.config,
                capabilities: aiModelData.capabilities,
                version: '1.0',
                createdAt: Date.now()
            };
            
            // Generate encryption key
            const encryptionKey = crypto.randomBytes(32);
            
            // Encrypt metadata
            const encryptedData = await this.encryption.encrypt(
                JSON.stringify(metadata),
                encryptionKey
            );
            
            // Store on 0G Storage
            const storageResult = await this.storage.store(encryptedData);
            
            // Seal key for owner
            const sealedKey = await this.encryption.sealKey(
                encryptionKey,
                ownerPublicKey
            );
            
            // Generate metadata hash
            const metadataHash = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(JSON.stringify(metadata))
            );
            
            return {
                encryptedURI: storageResult.uri,
                sealedKey,
                metadataHash
            };
        } catch (error) {
            throw new Error(`Failed to create AI agent: ${error.message}`);
        }
    }
    
    async mintINFT(contract, recipient, aiAgentData) {
        try {
            // Validate input parameters
            if (!contract || !recipient || !aiAgentData) {
                throw new Error('Missing required minting parameters');
            }
            
            const { encryptedURI, sealedKey, metadataHash } = aiAgentData;
            
            if (!encryptedURI || !sealedKey || !metadataHash) {
                throw new Error('Missing required AI agent data fields');
            }
            
            // Execute minting transaction
            const tx = await contract.mint(
                recipient,
                encryptedURI,
                metadataHash
            );
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            const tokenId = receipt.events[0].args.tokenId;
            
            console.log(`INFT minted successfully: Token ID ${tokenId} for ${recipient}`);
            
            return {
                tokenId,
                sealedKey,
                transactionHash: receipt.transactionHash
            };
        } catch (error) {
            console.error(`INFT minting failed: ${error.message}`, error);
            throw new Error(`INFT minting failed: ${error.message}`);
        }
    }

    async getEncryptedURI(contract, tokenId) {
        try {
            if (!contract || !tokenId) {
                throw new Error('Contract and tokenId are required');
            }
            
            const uri = await contract.tokenURI(tokenId);
            if (!uri) {
                throw new Error(`No URI found for token ${tokenId}`);
            }
            
            return uri;
        } catch (error) {
            console.error(`Failed to get encrypted URI: ${error.message}`, error);
            throw new Error(`Failed to get encrypted URI: ${error.message}`);
        }
    }

    async updateMetadata(contract, tokenId, newMetadata, ownerPrivateKey) {
        try {
            // Validate input parameters
            if (!contract || !tokenId || !newMetadata || !ownerPrivateKey) {
                throw new Error('Missing required metadata update parameters');
            }
            
            // Get current encrypted URI
            const currentURI = await this.getEncryptedURI(contract, tokenId);
            if (!currentURI) {
                throw new Error(`No URI found for token ${tokenId}`);
            }
            
            // Retrieve and decrypt current metadata
            const encryptedData = await this.storage.retrieve(currentURI);
            if (!encryptedData) {
                throw new Error(`Failed to retrieve data from storage for URI: ${currentURI}`);
            }
            
            const encryptedKey = await contract.getEncryptedMetadataKey(tokenId);
            if (!encryptedKey) {
                throw new Error(`Failed to get encrypted metadata key for token ${tokenId}`);
            }
            
            const encryptionKey = await this.encryption.unsealKey(
                encryptedKey,
                ownerPrivateKey
            );
            
            // Update metadata
            const updatedMetadata = {
                ...JSON.parse(await this.encryption.decrypt(encryptedData, encryptionKey)),
                ...newMetadata,
                updatedAt: Date.now()
            };
            
            // Re-encrypt with same key
            const newEncryptedData = await this.encryption.encrypt(
                JSON.stringify(updatedMetadata),
                encryptionKey
            );
            
            // Store updated encrypted data
            const storageResult = await this.storage.store(newEncryptedData);
            
            // Generate updated metadata hash
            const updatedMetadataHash = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(JSON.stringify(updatedMetadata))
            );
            
            // Update contract with new URI and hash
            const tx = await contract.updateMetadata(
                tokenId,
                storageResult.uri,
                updatedMetadataHash
            );
            
            const receipt = await tx.wait();
            console.log(`Metadata updated successfully for token ${tokenId}`);
            
            return {
                tokenId,
                newURI: storageResult.uri,
                transactionHash: receipt.transactionHash
            };
        } catch (error) {
            console.error(`Metadata update failed: ${error.message}`, error);
            throw new Error(`Failed to update metadata: ${error.message}`);
        }
    }
}

module.exports = MetadataManager;