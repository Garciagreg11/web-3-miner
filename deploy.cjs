const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // ⭐ BASE MAINNET RPC
  const provider = new hre.ethers.JsonRpcProvider("https://mainnet.base.org");

  // ⭐ Correct nonce for Base Mainnet
  let nonce = await provider.getTransactionCount(deployer.address, "pending");
  console.log("Starting nonce:", nonce);

  const gasPrice = hre.ethers.parseUnits("5", "gwei");
  const gasLimit = 5000000;

  // ⭐ Deploy RewardsVault
  const RewardsVault = await hre.ethers.getContractFactory("RewardsVault");
  const rewardsVault = await RewardsVault.deploy(
    deployer.address, // vault owner
    { gasPrice, gasLimit, nonce: nonce++ }
  );
  await rewardsVault.waitForDeployment();
  console.log("RewardsVault:", await rewardsVault.getAddress());

  // ⭐ Deploy WorkVerifier
  const WorkVerifier = await hre.ethers.getContractFactory("WorkVerifier");
  const workVerifier = await WorkVerifier.deploy({
    gasPrice,
    gasLimit,
    nonce: nonce++
  });
  await workVerifier.waitForDeployment();
  console.log("WorkVerifier:", await workVerifier.getAddress());

  // ⭐ Deploy MiningSession (correct constructor args)
  const MiningSession = await hre.ethers.getContractFactory("MiningSession");
  const miningSession = await MiningSession.deploy(
    await rewardsVault.getAddress(), // vault
    deployer.address,                // dev wallet
    24,                              // initial difficulty
    1n,                              // reward per share
    { gasPrice, gasLimit, nonce: nonce++ }
  );
  await miningSession.waitForDeployment();
  console.log("MiningSession:", await miningSession.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
