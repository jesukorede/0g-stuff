# INFT Deployment Guide

This guide explains how to deploy the INFT contract and update the frontend with the contract addresses.

## Deployment Steps

1. Deploy the contracts to the 0G testnet:

```bash
npx hardhat run scripts/deploy.js --network 0g-testnet
```

2. After successful deployment, you'll see the contract addresses in the console output:

```
MockOracle deployed to: 0x...
INFT deployed to: 0x...
```

3. Update the frontend constants with these addresses.

## Updating Frontend Constants

Open the frontend constants file and update the contract addresses:

```javascript
// In your frontend constants file (e.g., constants/contracts.js)
export const CONTRACT_ADDRESSES = {
  INFT: "0x...", // Replace with your deployed INFT address
  ORACLE: "0x..." // Replace with your deployed MockOracle address
};
```

## Using the Managers

The implementation includes two manager classes:

1. **MetadataManager**: Handles AI agent metadata creation, encryption, and updates
2. **TransferManager**: Manages secure transfers and agent authorizations

Example usage:

```javascript
import { ethers } from 'ethers';
import MetadataManager from '../lib/MetadataManager';
import TransferManager from '../lib/TransferManager';
import { CONTRACT_ADDRESSES } from '../constants/contracts';

// Initialize services
const storageService = new OGStorageService();
const encryptionService = new EncryptionService();
const oracleService = new OracleService();

// Initialize managers
const metadataManager = new MetadataManager(storageService, encryptionService);
const transferManager = new TransferManager(oracleService, metadataManager, storageService);

// Connect to contracts
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const inftContract = new ethers.Contract(CONTRACT_ADDRESSES.INFT, INFT_ABI, signer);

// Use managers
async function createAndMintAgent(aiModelData, ownerPublicKey, recipientAddress) {
  const agentData = await metadataManager.createAIAgent(aiModelData, ownerPublicKey);
  return await metadataManager.mintINFT(inftContract, recipientAddress, agentData);
}
```

## Security Considerations

- Keep private keys secure and never expose them in frontend code
- Use proper authentication for all operations
- Validate all inputs before sending transactions
- Monitor contract events for important state changes