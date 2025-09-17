const { ethers } = require('hardhat');
const MetadataManager = require('../lib/MetadataManager');
const TransferManager = require('../lib/TransferManager');

// Mock services for testing
const mockStorage = {
  store: async (data) => ({ uri: `ipfs://mock-uri-${Date.now()}` }),
  retrieve: async (uri) => Buffer.from(JSON.stringify({ model: 'test-model', capabilities: ['test'] }))
};

const mockEncryption = {
  encrypt: async (data, key) => Buffer.from(data),
  decrypt: async (data, key) => data.toString(),
  sealKey: async (key, publicKey) => Buffer.from('sealed-key'),
  unsealKey: async (sealedKey, privateKey) => Buffer.from('decrypted-key')
};

const mockOracle = {
  prepareTransfer: async (request) => ({ sealedKey: 'mock-sealed-key', proof: 'mock-proof' }),
  createAuthorization: async (request) => ({ sealedKey: 'mock-sealed-key', proof: 'mock-proof' })
};

async function main() {
  console.log('Testing INFT implementation...');
  
  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}`);
  
  // Deploy MockOracle
  console.log('Deploying MockOracle...');
  const MockOracle = await ethers.getContractFactory('MockOracle');
  const mockOracleContract = await MockOracle.deploy();
  await mockOracleContract.deployed();
  console.log(`MockOracle deployed to: ${mockOracleContract.address}`);
  
  // Deploy INFT
  console.log('Deploying INFT contract...');
  const INFT = await ethers.getContractFactory('INFT');
  const inftContract = await INFT.deploy(
    'AI Agent NFTs',
    'AINFT',
    mockOracleContract.address
  );
  await inftContract.deployed();
  console.log(`INFT deployed to: ${inftContract.address}`);
  
  // Initialize managers
  const metadataManager = new MetadataManager(mockStorage, mockEncryption);
  const transferManager = new TransferManager(mockOracle, metadataManager, mockStorage);
  
  try {
    // Create AI agent
    console.log('Creating AI agent...');
    const aiModelData = {
      model: 'GPT-4',
      weights: 'weights-hash',
      config: { temperature: 0.7 },
      capabilities: ['text-generation', 'code-completion']
    };
    
    const agentData = await metadataManager.createAIAgent(
      aiModelData,
      'mock-public-key'
    );
    console.log('AI agent created successfully');
    
    // Mint INFT
    console.log('Minting INFT...');
    const mintResult = await metadataManager.mintINFT(
      inftContract.connect(deployer),
      user1.address,
      agentData
    );
    console.log(`INFT minted with token ID: ${mintResult.tokenId}`);
    
    // Authorize agent
    console.log('Authorizing agent...');
    const authResult = await transferManager.authorizeAgent(
      inftContract.connect(user1),
      mintResult.tokenId,
      user2.address,
      'mock-executor-public-key'
    );
    console.log('Agent authorized successfully');
    
    // Prepare transfer
    console.log('Preparing transfer...');
    const transferData = await transferManager.prepareTransfer(
      inftContract,
      mintResult.tokenId,
      user1.address,
      user2.address
    );
    
    // Execute transfer
    console.log('Executing transfer...');
    await transferManager.executeTransfer(
      inftContract.connect(user1),
      transferData
    );
    console.log('Transfer executed successfully');
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });