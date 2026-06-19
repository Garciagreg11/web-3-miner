import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const rewardToken = "0xf150e8f60d21D3C07066348f717b3B2e6E2dEd9c"; 

  const RewardsVault = await ethers.getContractFactory("RewardsVault");
  const vault = await RewardsVault.deploy(rewardToken);

  await vault.waitForDeployment();

  console.log("RewardsVault deployed at:", await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
