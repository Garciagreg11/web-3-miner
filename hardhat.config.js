import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";
dotenv.config();

export default {
  solidity: "0.8.24",
  networks: {
    baseSepolia: {
      url: process.env.RPC_URL,          // should be https://sepolia.base.org
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 5000000000,
      nonce: "pending"
    }
  }
};

