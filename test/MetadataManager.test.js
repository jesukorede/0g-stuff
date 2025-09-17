const { expect } = require("chai");
const { MetadataManager } = require("../src/services/inft/MetadataManager");

describe("MetadataManager", function () {
  let metadataManager;
  const testEncryptionKey = "test-encryption-key";
  
  beforeEach(function () {
    metadataManager = new MetadataManager(testEncryptionKey);
  });
  
  it("Should create agent metadata", function () {
    const metadata = metadataManager.createAgentMetadata({
      name: "Test Agent",
      description: "A test agent",
      agentType: "text",
      modelId: "test-model",
      creator: "0x123"
    });
    
    expect(metadata.name).to.equal("Test Agent");
    expect(metadata.description).to.equal("A test agent");
    expect(metadata.agentType).to.equal("text");
    expect(metadata.modelId).to.equal("test-model");
    expect(metadata.creator).to.equal("0x123");
  });
  
  it("Should encrypt and decrypt metadata", function () {
    const originalMetadata = metadataManager.createAgentMetadata({
      name: "Test Agent",
      description: "A test agent",
      agentType: "text"
    });
    
    const encrypted = metadataManager.encryptMetadata(originalMetadata);
    expect(encrypted).to.be.a("string");
    
    const decrypted = metadataManager.decryptMetadata(encrypted);
    expect(decrypted).to.deep.equal(originalMetadata);
  });
  
  it("Should prepare metadata for minting", async function () {
    const metadata = metadataManager.createAgentMetadata({
      name: "Test Agent",
      description: "A test agent",
      agentType: "text",
      modelId: "test-model",
      creator: "0x123"
    });
    
    const ownerPublicKey = "owner-public-key";
    
    const result = await metadataManager.prepareForMinting(metadata, ownerPublicKey);
    
    expect(result).to.have.property("tokenURI");
    expect(result.tokenURI).to.be.a("string");
    expect(result.tokenURI).to.include("https://ipfs.io/ipfs/Qm");
    
    expect(result).to.have.property("encryptedMetadataKey");
    expect(result.encryptedMetadataKey).to.be.a("string");
    
    expect(result).to.have.property("agentType");
    expect(result.agentType).to.equal("text");
  });
  
  it("Should encrypt metadata key for recipient", function () {
    const recipientPublicKey = "recipient-public-key";
    
    const encryptedKey = metadataManager.encryptMetadataKeyForRecipient(recipientPublicKey);
    
    expect(encryptedKey).to.be.a("string");
    // The encrypted key should be deterministic for the same inputs
    const encryptedKey2 = metadataManager.encryptMetadataKeyForRecipient(recipientPublicKey);
    expect(encryptedKey).to.equal(encryptedKey2);
    
    // Different recipient keys should produce different encrypted keys
    const differentRecipientKey = "different-recipient-key";
    const differentEncryptedKey = metadataManager.encryptMetadataKeyForRecipient(differentRecipientKey);
    expect(encryptedKey).to.not.equal(differentEncryptedKey);
  });
});