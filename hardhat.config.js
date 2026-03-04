require("@nomicfoundation/hardhat-toolbox");

const BASE_SEPOLIA_URL = process.env.BASE_SEPOLIA_URL || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    baseSepolia: {
      url: BASE_SEPOLIA_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []
    }
  }
};

