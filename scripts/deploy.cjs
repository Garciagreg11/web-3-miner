const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. Deploy RewardToken (ERC20)
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("RewardToken:", rewardTokenAddress);

  // 2. Deploy RewardsVault with rewardToken address
  const RewardsVault = await hre.ethers.getContractFactory("RewardsVault");
  const vault = await RewardsVault.deploy(rewardTokenAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("RewardsVault:", vaultAddress);

  // 3. Deploy MiningSession with 3 required arguments
  const MiningSession = await hre.ethers.getContractFactory("MiningSession");

  const initialTarget = 0; // ignored because you hardcoded target
  const rewardPerShare = 1;

  const miningSession = await MiningSession.deploy(
    vaultAddress,
    initialTarget,
    rewardPerShare
  );

  await miningSession.waitForDeployment();
  const miningSessionAddress = await miningSession.getAddress();
  console.log("MiningSession:", miningSessionAddress);

  // 4. Set MiningSession as minter on RewardToken (if your token supports it)
  if (rewardToken.setMinter) {
    const tx = await rewardToken.setMinter(miningSessionAddress);
    await tx.wait();
    console.log("MiningSession set as minter");
  } else {
    console.log("RewardToken has no setMinter() function — skipping");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
