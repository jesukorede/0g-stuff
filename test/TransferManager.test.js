const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MetadataManager } = require("../src/services/inft/MetadataManager");
const { TransferManager } = require("../src/services/inft/TransferManager");

describe("TransferManager", function () {
  let mockProvider;
  let mockSigner;
  let mockInftContract;
  let mockOracleContract;
  let metadataManager;
  let transferManager;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    // Mock signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Create mock provider
    mockProvider = new ethers.JsonRpcProvider();
    mockSigner = owner;
    
    // Create mock contracts with spies
    mockInftContract = {
      connect: () => ({
        transferFrom: async () => ({ wait: async () => ({}) }),
        updateMetadata: async () => ({}),
        grantAuthorization: async () => ({}),
        revokeAuthorization: async () => ({}),
        getEncryptedMetadataKey: async () => "mockEncryptedKey",
        tokenURI: async () => "ipfs://mockURI"
      }),
      isAuthorized: async () => true
    };
    
    mockOracleContract = {
      connect: () => ({
        authorizeRequest: async () => ({
          wait: async () => ({
            logs: [{
              topics: [
                ethers.id("RequestAuthorized(bytes32,address,uint256)"),
                "0x1234567890123456789012345678901234567890123456789012345678901234"
              ]
            }]
          })
        })
      })
    };
    
    // Initialize MetadataManager
    metadataManager = new MetadataManager("test-encryption-key");
    
    // Initialize TransferManager with mocks
    transferManager = new TransferManager(
      mockProvider,
      "0xINFTContractAddress",
      [],  // ABI
      "0xOracleContractAddress",
      [],  // ABI
      metadataManager
    );
    
    // Replace the contract instances with our mocks
    transferManager.inftContract = mockInftContract;
    transferManager.oracleContract = mockOracleContract;
  });
  
  describe("transferINFT", function () {
    it("Should transfer an INFT to a new owner", async function () {
      const tokenId = 1;
      const fromAddress = addr1.address;
      const toAddress = addr2.address;
      const recipientPublicKey = "recipient-public-key";
      
      // Spy on the contract methods
      let transferCalled = false;
      let updateMetadataCalled = false;
      
      mockInftContract.connect = () => ({
        transferFrom: async (from, to, id) => {
          expect(from).to.equal(fromAddress);
          expect(to).to.equal(toAddress);
          expect(id).to.equal(tokenId);
          transferCalled = true;
          return { wait: async () => ({}) };
        },
        updateMetadata: async (id, uri, key) => {
          expect(id).to.equal(tokenId);
          updateMetadataCalled = true;
          return {};
        },
        getEncryptedMetadataKey: async () => "mockEncryptedKey",
        tokenURI: async () => "ipfs://mockURI"
      });
      
      await transferManager.transferINFT(
        mockSigner,
        tokenId,
        fromAddress,
        toAddress,
        recipientPublicKey
      );
      
      expect(transferCalled).to.be.true;
      expect(updateMetadataCalled).to.be.true;
    });
  });
  
  describe("Authorization", function () {
    it("Should authorize a user", async function () {
      const tokenId = 1;
      const userAddress = addr2.address;
      
      let authorizeCalled = false;
      mockInftContract.connect = () => ({
        grantAuthorization: async (id, user) => {
          expect(id).to.equal(tokenId);
          expect(user).to.equal(userAddress);
          authorizeCalled = true;
          return {};
        }
      });
      
      await transferManager.authorizeUser(mockSigner, tokenId, userAddress);
      expect(authorizeCalled).to.be.true;
    });
    
    it("Should revoke authorization", async function () {
      const tokenId = 1;
      const userAddress = addr2.address;
      
      let revokeCalled = false;
      mockInftContract.connect = () => ({
        revokeAuthorization: async (id, user) => {
          expect(id).to.equal(tokenId);
          expect(user).to.equal(userAddress);
          revokeCalled = true;
          return {};
        }
      });
      
      await transferManager.revokeAuthorization(mockSigner, tokenId, userAddress);
      expect(revokeCalled).to.be.true;
    });
    
    it("Should check if a user is authorized", async function () {
      const tokenId = 1;
      const userAddress = addr2.address;
      
      let isAuthorizedCalled = false;
      mockInftContract.isAuthorized = async (id, user) => {
        expect(id).to.equal(tokenId);
        expect(user).to.equal(userAddress);
        isAuthorizedCalled = true;
        return true;
      };
      
      const result = await transferManager.isAuthorized(tokenId, userAddress);
      expect(isAuthorizedCalled).to.be.true;
      expect(result).to.be.true;
    });
  });
  
  describe("requestInferenceAuthorization", function () {
    it("Should request authorization from the oracle", async function () {
      const tokenId = 1;
      const requesterAddress = addr1.address;
      
      let requestCalled = false;
      mockOracleContract.connect = () => ({
        authorizeRequest: async (requester, id, timestamp) => {
          expect(requester).to.equal(requesterAddress);
          expect(id).to.equal(tokenId);
          requestCalled = true;
          return {
            wait: async () => ({
              logs: [{
                topics: [
                  ethers.id("RequestAuthorized(bytes32,address,uint256)"),
                  "0x1234567890123456789012345678901234567890123456789012345678901234"
                ]
              }]
            })
          };
        }
      });
      
      const requestId = await transferManager.requestInferenceAuthorization(
        mockSigner,
        tokenId,
        requesterAddress
      );
      
      expect(requestCalled).to.be.true;
      expect(requestId).to.equal("0x1234567890123456789012345678901234567890123456789012345678901234");
    });
  });
});