const { ethers } = require("hardhat");

async function main() {
  // Your already deployed Base Mainnet contract address
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MINING_SESSION;

  // ABI from your compiled artifacts
  const Contract = await ethers.getContractFactory("MiningSession");

  // Attach instead of deploy
  const contract = Contract.attach(CONTRACT_ADDRESS);

  console.log("Attached to existing contract at:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
