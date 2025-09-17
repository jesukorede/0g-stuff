const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("INFT Contract", function () {
  let INFT;
  let inft;
  let MockOracle;
  let mockOracle;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy MockOracle
    MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy(owner.address);
    await mockOracle.waitForDeployment();
    
    // Deploy INFT
    INFT = await ethers.getContractFactory("INFT");
    inft = await INFT.deploy(
      "Intelligent NFT",
      "INFT",
      owner.address,
      await mockOracle.getAddress()
    );
    await inft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await inft.owner()).to.equal(owner.address);
    });

    it("Should set the correct oracle address", async function () {
      expect(await inft.oracleAddress()).to.equal(await mockOracle.getAddress());
    });
  });

  describe("Minting", function () {
    it("Should mint a new INFT", async function () {
      const tokenId = 1;
      const tokenURI = "ipfs://QmTest";
      const encryptedKey = "encryptedTestKey";
      const agentType = "text";
      
      await inft.mint(addr1.address, tokenId, tokenURI, encryptedKey, agentType);
      
      expect(await inft.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await inft.tokenURI(tokenId)).to.equal(tokenURI);
      expect(await inft.getAgentType(tokenId)).to.equal(agentType);
    });
  });

  describe("Authorization", function () {
    it("Should authorize a user", async function () {
      const tokenId = 1;
      await inft.mint(addr1.address, tokenId, "ipfs://QmTest", "encryptedTestKey", "text");
      
      // Connect as token owner
      const inftAsAddr1 = inft.connect(addr1);
      await inftAsAddr1.grantAuthorization(tokenId, addr2.address);
      
      expect(await inft.isAuthorized(tokenId, addr2.address)).to.be.true;
    });

    it("Should revoke authorization", async function () {
      const tokenId = 1;
      await inft.mint(addr1.address, tokenId, "ipfs://QmTest", "encryptedTestKey", "text");
      
      // Connect as token owner
      const inftAsAddr1 = inft.connect(addr1);
      await inftAsAddr1.grantAuthorization(tokenId, addr2.address);
      expect(await inft.isAuthorized(tokenId, addr2.address)).to.be.true;
      
      await inftAsAddr1.revokeAuthorization(tokenId, addr2.address);
      expect(await inft.isAuthorized(tokenId, addr2.address)).to.be.false;
    });
  });

  describe("Transfers", function () {
    it("Should transfer INFT and update authorizations", async function () {
      const tokenId = 1;
      await inft.mint(addr1.address, tokenId, "ipfs://QmTest", "encryptedTestKey", "text");
      
      // Authorize addr2
      const inftAsAddr1 = inft.connect(addr1);
      await inftAsAddr1.grantAuthorization(tokenId, addr2.address);
      expect(await inft.isAuthorized(tokenId, addr2.address)).to.be.true;
      
      // Transfer to owner
      await inftAsAddr1.transferFrom(addr1.address, owner.address, tokenId);
      
      // Check new owner
      expect(await inft.ownerOf(tokenId)).to.equal(owner.address);
      
      // Previous authorizations should be revoked
      expect(await inft.isAuthorized(tokenId, addr2.address)).to.be.false;
      
      // New owner should be authorized
      expect(await inft.isAuthorized(tokenId, owner.address)).to.be.true;
    });
  });
});