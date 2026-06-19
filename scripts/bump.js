const hardhat = require("hardhat");
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();

  const nonce = await ethers.provider.getTransactionCount(
    deployer.address,
    "pending"
  );

  console.log("Using nonce:", nonce);

  const tx = await deployer.sendTransaction({
    to: deployer.address,
    value: 0,
    gasPrice: ethers.parseUnits("10", "gwei"),
    gasLimit: 21000,
    nonce,
  });

  console.log("Sent bump tx:", tx.hash);
  await tx.wait();
  console.log("Bump confirmed");
}

main().catch(console.error);
