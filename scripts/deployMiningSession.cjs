const hre = require("hardhat");

async function main() {
  const vault = "0x96b320758AEFa406F621b1FAaa721671b63c3e73"; // REAL vault address
  const initialTarget = BigInt("1766847064778384329583297500742918515827483896875618958121606201292619776"); // 2**240
  const rewardPerShare = BigInt("1000000000000000000"); // 1e18

  const MiningSession = await hre.ethers.deployContract("MiningSession", [
    vault,
    initialTarget,
    rewardPerShare,
  ]);

  await MiningSession.waitForDeployment();

  console.log("MiningSession deployed to:", MiningSession.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
