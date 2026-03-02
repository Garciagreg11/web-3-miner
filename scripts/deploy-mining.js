import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;

async function main() {
  const tokenAddress = "0xf150e8f60d21D3C07066348f717b3B2e6E2dEd9c";

  console.log("Deploying RewardsVault...");
  const RewardsVault = await ethers.getContractFactory("RewardsVault");
  const rewardsVault = await upgrades.deployProxy(
    RewardsVault,
    [tokenAddress],
    { initializer: "initialize" }
  );
  console.log("RewardsVault deployed at:", await rewardsVault.getAddress());

  console.log("Deploying WorkVerifier...");
  const WorkVerifier = await ethers.getContractFactory("WorkVerifier");
  const workVerifier = await upgrades.deployProxy(
    WorkVerifier,
    [],
    { initializer: "initialize" }
  );
  console.log("WorkVerifier deployed at:", await workVerifier.getAddress());

  console.log("Deploying MiningSession...");
  const MiningSession = await ethers.getContractFactory("MiningSession");
  const miningSession = await upgrades.deployProxy(
    MiningSession,
    [
      tokenAddress,
      await rewardsVault.getAddress(),
      await workVerifier.getAddress()
    ],
    { initializer: "initialize" }
  );
  console.log("MiningSession deployed at:", await miningSession.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

