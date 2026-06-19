const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const vaultAddress = "YOUR_VAULT_ADDRESS_HERE";
  const initialDifficulty = 1000000000000000n; // adjust as needed
  const rewardPerShare = 1n; // adjust as needed

  const MiningSession = await ethers.getContractFactory("MiningSession");
  const proxy = await upgrades.deployProxy(
    MiningSession,
    [vaultAddress, initialDifficulty, rewardPerShare],
    {
      kind: "uups",
    }
  );

  await proxy.waitForDeployment();

  console.log("MiningSession proxy deployed to:", await proxy.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
