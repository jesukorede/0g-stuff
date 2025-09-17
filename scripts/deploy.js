const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy mock oracle for testing (replace with real oracle in production)
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const mockOracle = await MockOracle.deploy(deployer.address);
  const oracle = await MockOracle.deploy();
  await oracle.deployed();
  console.log("Oracle deployed to:", oracle.address);

  // Deploy INFT contract
  const INFT = await ethers.getContractFactory("INFT");
  const inft = await INFT.deploy(
    "AI Agent NFTs",
    "AINFT",
    oracle.address
  );
  await inft.deployed();
  console.log("INFT deployed to:", inft.address);

  // Update contract addresses in the frontend constants
  console.log("Update the following addresses in your frontend constants:");
  console.log(`INFT_CONTRACT_ADDRESS: "${inft.address}"`);
  console.log(`ORACLE_CONTRACT_ADDRESS: "${oracle.address}"`);
  
  // You can add code here to automatically update your frontend constants if needed
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });