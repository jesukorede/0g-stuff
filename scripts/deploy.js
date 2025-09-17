const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockOracle with initial owner (required by constructor)
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const oracle = await MockOracle.deploy(deployer.address);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("Oracle deployed to:", oracleAddress);

  // Deploy INFT with name, symbol, initialOwner, oracleAddress
  const INFT = await ethers.getContractFactory("INFT");
  const inft = await INFT.deploy(
    "AI Agent NFTs",
    "AINFT",
    deployer.address,
    oracleAddress
  );
  await inft.waitForDeployment();
  const inftAddress = await inft.getAddress();
  console.log("INFT deployed to:", inftAddress);

  // Output env-ready lines for frontend
  console.log("\nAdd these to your .env.local:\n");
  console.log(`NEXT_PUBLIC_INFT_ADDRESS=${inftAddress}`);
  console.log(`NEXT_PUBLIC_ORACLE_ADDRESS=${oracleAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });