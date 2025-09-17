require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    "0g-testnet": {
      url: process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai",
      chainId: parseInt(process.env.NEXT_PUBLIC_0G_CHAIN_ID || "16601"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};