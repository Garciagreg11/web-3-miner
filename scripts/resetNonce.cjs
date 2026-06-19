const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Using deployer:", deployer.address);

  const tx = await deployer.sendTransaction({
    to: deployer.address,            // send to yourself
    value: 0,                        // 0 ETH
    nonce: 0,                        // force replace stuck tx
    gasPrice: hre.ethers.parseUnits("50", "gwei") // high enough to overwrite
  });

  console.log("Replacement tx sent:", tx.hash);
  await tx.wait();
  console.log("Nonce 0 cleared.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
