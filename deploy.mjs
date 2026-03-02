import hre from "hardhat";
import { NonceManager } from "@ethersproject/experimental";

async function main() {
  // Wrap the signer with a NonceManager to avoid cached nonces
  const [rawSigner] = await hre.ethers.getSigners();
  const deployer = new NonceManager(rawSigner);

  console.log("Deploying with:", await deployer.getAddress());

  const gas = { gasPrice: hre.ethers.utils.parseUnits("5", "gwei") };

  // 1. RewardsVault(address rewardToken)
  const rewardTokenAddress = await deployer.getAddress();
  const RewardsVault = await hre.ethers.getContractFactory("RewardsVault", deployer);
  const rewardsVault = await RewardsVault.deploy(rewardTokenAddress, gas);
  await rewardsVault.deployed();
  console.log("RewardsVault:", rewardsVault.address);

  // 2. WorkVerifier() — NO constructor args
  const WorkVerifier = await hre.ethers.getContractFactory("WorkVerifier", deployer);
  const workVerifier = await WorkVerifier.deploy(gas);
  await workVerifier.deployed();
  console.log("WorkVerifier:", workVerifier.address);

  // 3. MiningSession(address vault, uint256 target, uint256 reward)
  const initialTarget = 2n ** 240n;
  const rewardPerShare = 1_000_000_000n;

  const MiningSession = await hre.ethers.getContractFactory("MiningSession", deployer);
  const miningSession = await MiningSession.deploy(
    rewardsVault.address,
    initialTarget,
    rewardPerShare,
    gas
  );
  await miningSession.deployed();
  console.log("MiningSession:", miningSession.address);

  // 4. BoostManager(address rewardToken)
  const BoostManager = await hre.ethers.getContractFactory("BoostManager", deployer);
  const boostManager = await BoostManager.deploy(rewardTokenAddress, gas);
  await boostManager.deployed();
  console.log("BoostManager:", boostManager.address);

  // 5. Linking
  await boostManager.setMiningSession(miningSession.address, gas);
  await miningSession.setBoostManager(boostManager.address, gas);

  console.log("All contracts deployed and linked.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
