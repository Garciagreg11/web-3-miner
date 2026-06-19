const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Correct starting nonce
  const provider = new hre.ethers.JsonRpcProvider("https://sepolia.base.org");
  let nonce = await provider.getTransactionCount(deployer.address, "pending");
  console.log("Starting nonce:", nonce);

  const gasPrice = hre.ethers.parseUnits("5", "gwei");
  const gasLimit = 5000000; // 🔥 CRITICAL FIX

  // Deploy RewardsVault
  const RewardsVault = await hre.ethers.getContractFactory("RewardsVault");
  const rewardsVault = await RewardsVault.deploy(
    "0xf150e8f60d21D3C07066348f717b3B2e6E2dEd9c",
    { gasPrice, gasLimit, nonce: nonce++ }
  );
  await rewardsVault.waitForDeployment();
  console.log("RewardsVault:", await rewardsVault.getAddress());

  // Deploy WorkVerifier
  const WorkVerifier = await hre.ethers.getContractFactory("WorkVerifier");
  const workVerifier = await WorkVerifier.deploy({
    gasPrice,
    gasLimit,
    nonce: nonce++
  });
  await workVerifier.waitForDeployment();
  console.log("WorkVerifier:", await workVerifier.getAddress());

  // Deploy MiningSession
  const MiningSession = await hre.ethers.getContractFactory("MiningSession");
  const miningSession = await MiningSession.deploy(
    await rewardsVault.getAddress(),
    2n ** 240n,
    1n,
    { gasPrice, gasLimit, nonce: nonce++ }
  );
  await miningSession.waitForDeployment();
  console.log("MiningSession:", await miningSession.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
