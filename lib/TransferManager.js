class TransferManager {
    constructor(oracle, metadataManager, storageService) {
        this.oracle = oracle;
        this.metadata = metadataManager;
        this.storage = storageService;
    }
    
    async prepareTransfer(tokenId, fromAddress, toAddress, toPublicKey) {
        try {
            // Retrieve current metadata
            const currentURI = await this.metadata.getEncryptedURI(tokenId);
            if (!currentURI) {
                throw new Error(`Token ID ${tokenId} does not exist or has no URI`);
            }
            
            const encryptedData = await this.storage.retrieve(currentURI);
            if (!encryptedData) {
                throw new Error(`Failed to retrieve encrypted data from ${currentURI}`);
            }
            
            // Request oracle to re-encrypt for new owner
            const transferRequest = {
                tokenId,
                encryptedData,
                fromAddress,
                toAddress,
                toPublicKey
            };
            
            // Get oracle proof and new sealed key
            const oracleResponse = await this.oracle.processTransfer(transferRequest);
            if (!oracleResponse || !oracleResponse.sealedKey || !oracleResponse.proof) {
                throw new Error('Oracle response is invalid or incomplete');
            }
            
            return {
                sealedKey: oracleResponse.sealedKey,
                proof: oracleResponse.proof,
                newEncryptedURI: oracleResponse.newURI
            };
        } catch (error) {
            console.error(`Transfer preparation failed: ${error.message}`, error);
            throw new Error(`Transfer preparation failed: ${error.message}`);
        }
    }
    
    async executeTransfer(contract, transferData) {
        try {
            const { from, to, tokenId, sealedKey, proof } = transferData;
            
            // Validate input parameters
            if (!from || !to || !tokenId || !sealedKey || !proof) {
                throw new Error('Missing required transfer parameters');
            }
            
            // Verify ownership before transfer
            const currentOwner = await contract.ownerOf(tokenId);
            if (currentOwner.toLowerCase() !== from.toLowerCase()) {
                throw new Error(`Transfer failed: ${from} is not the owner of token ${tokenId}`);
            }
            
            // Execute transfer
            const tx = await contract.transfer(
                from,
                to,
                tokenId,
                sealedKey,
                proof
            );
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log(`Transfer successful: ${from} -> ${to} (Token ID: ${tokenId})`);
            return receipt;
        } catch (error) {
            console.error(`Transfer execution failed: ${error.message}`, error);
            throw new Error(`Transfer execution failed: ${error.message}`);
        }
    }

    async authorizeAgent(contract, tokenId, executorAddress, executorPublicKey) {
        try {
            // Validate input parameters
            if (!tokenId || !executorAddress || !executorPublicKey) {
                throw new Error('Missing required authorization parameters');
            }
            
            // Get token owner
            const owner = await contract.ownerOf(tokenId);
            
            // Check if already authorized
            const isAlreadyAuthorized = await contract.isAuthorized(tokenId, executorAddress);
            if (isAlreadyAuthorized) {
                console.log(`${executorAddress} is already authorized for token ${tokenId}`);
                return { alreadyAuthorized: true };
            }
            
            // Request oracle to create authorization
            const authRequest = {
                tokenId,
                owner,
                executor: executorAddress,
                executorPublicKey
            };
            
            // Get oracle authorization
            const authResponse = await this.oracle.createAuthorization(authRequest);
            if (!authResponse || !authResponse.sealedKey || !authResponse.proof) {
                throw new Error('Oracle authorization response is invalid or incomplete');
            }
            
            // Execute authorization on contract
            const tx = await contract.grantAuthorization(
                tokenId,
                executorAddress,
                authResponse.sealedKey,
                authResponse.proof
            );
            
            const receipt = await tx.wait();
            console.log(`Authorization successful: ${executorAddress} for token ${tokenId}`);
            return receipt;
        } catch (error) {
            console.error(`Authorization failed: ${error.message}`, error);
            throw new Error(`Authorization failed: ${error.message}`);
        }
    }

    async revokeAuthorization(contract, tokenId, executorAddress) {
        try {
            // Validate input parameters
            if (!tokenId || !executorAddress) {
                throw new Error('Missing required revocation parameters');
            }
            
            // Check if actually authorized
            const isAuthorized = await contract.isAuthorized(tokenId, executorAddress);
            if (!isAuthorized) {
                console.log(`${executorAddress} is not authorized for token ${tokenId}`);
                return { notAuthorized: true };
            }
            
            // Execute revocation
            const tx = await contract.revokeAuthorization(tokenId, executorAddress);
            const receipt = await tx.wait();
            
            console.log(`Revocation successful: ${executorAddress} for token ${tokenId}`);
            return receipt;
        } catch (error) {
            console.error(`Revocation failed: ${error.message}`, error);
            throw new Error(`Revocation failed: ${error.message}`);
        }
    }
}

module.exports = TransferManager;