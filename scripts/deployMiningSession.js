import hre from "hardhat";

async function main() {
  const RewardsVault = "YOUR_REWARDS_VAULT_ADDRESS"; // if already deployed
  const initialTarget = 2n ** 240n;
  const rewardPerShare = 1_000_000_000n;

  const MiningSession = await hre.ethers.deployContract(
    "MiningSession",
    [RewardsVault, initialTarget, rewardPerShare]
  );

  await MiningSession.waitForDeployment();
  console.log("MiningSession deployed to:", MiningSession.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
