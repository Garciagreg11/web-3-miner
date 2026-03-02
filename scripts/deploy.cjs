const hre = require("hardhat");

async function main() {
  // 1. Deploy your ERC20 reward token
  const Token = await hre.ethers.deployContract("greggarcia72");
  await Token.waitForDeployment();
  const tokenAddress = Token.target;
  console.log("Reward Token deployed at:", tokenAddress);

  // 2. Deploy RewardsVault with the token address
  const RewardsVault = await hre.ethers.deployContract(
    "RewardsVault",
    [tokenAddress]
  );
  await RewardsVault.waitForDeployment();
  const vaultAddress = RewardsVault.target;
  console.log("RewardsVault deployed at:", vaultAddress);

  // 3. Deploy WorkVerifier (0 args)
  const WorkVerifier = await hre.ethers.deployContract("WorkVerifier");
  await WorkVerifier.waitForDeployment();
  const verifierAddress = WorkVerifier.target;
  console.log("WorkVerifier deployed at:", verifierAddress);

  // 4. Deploy MiningSession (3 args)
  const initialTarget = 2n ** 240n; // example difficulty
  const rewardPerShare = 1000;      // example reward

  const MiningSession = await hre.ethers.deployContract(
    "MiningSession",
    [
      vaultAddress,
      initialTarget,
      rewardPerShare
    ]
  );
  await MiningSession.waitForDeployment();
  const miningSessionAddress = MiningSession.target;
  console.log("MiningSession deployed at:", miningSessionAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

