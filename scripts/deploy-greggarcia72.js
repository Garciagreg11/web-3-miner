
import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;

async function main() {
  const TOKEN_NAME = "greggarcia72";
  const TOKEN_SYMBOL = "GG72";

  // ethers v5 uses ethers.utils.parseUnits
  const INITIAL_MINT = ethers.utils.parseUnits("10000000", 18);

  const OWNER = "0x94BDAc080Dc82667F928352F9F8591d84d0D26f7";

  console.log("Deploying GG72 token...");

  const GG72 = await ethers.getContractFactory("GG72Token");
  const gg72 = await upgrades.deployProxy(
    GG72,
    [TOKEN_NAME, TOKEN_SYMBOL, INITIAL_MINT, OWNER],
    { initializer: "initialize", kind: "uups" }
  );

  await gg72.deployed();

  console.log("GG72 deployed at:", gg72.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
