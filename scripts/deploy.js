require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const rewardTokenAddress = process.env.GG72_TOKEN;
  if (!rewardTokenAddress) {
    throw new Error("Missing GG72_TOKEN in .env");
  }
  console.log("Reward token:", rewardTokenAddress);

  // 1. Deploy RewardsVault
  const RewardsVault = await hre.ethers.getContractFactory("RewardsVault");
  const vault = await RewardsVault.deploy(rewardTokenAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("RewardsVault deployed at:", vaultAddress);

  // 2. Deploy MiningSession
  const MiningSession = await hre.ethers.getContractFactory("MiningSession");

  const devWallet = deployer.address; // Sets your developer/fee wallet as the deployer
  const initialDifficulty = 16; 
  const rewardPerShare = hre.ethers.parseUnits("1", 18);

  // FIXED: Perfectly matching your exact contract constructor order
  const ms = await MiningSession.deploy(
    vaultAddress,
    devWallet,
    initialDifficulty,
    rewardPerShare
  );

  await ms.waitForDeployment();
  const msAddress = await ms.getAddress();
  console.log("MiningSession deployed at:", msAddress);

  console.log("\n=== UPDATE YOUR FRONTEND ===");
  console.log("export const MINING_SESSION =", `"${msAddress}";`);
  console.log("export const REWARDS_VAULT =", `"${vaultAddress}";`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
