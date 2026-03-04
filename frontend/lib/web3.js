import { BrowserProvider, Contract } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532);

export async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error("No wallet detected");

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(CHAIN_ID)) {
    throw new Error(`Wrong network. Expected chainId ${CHAIN_ID}`);
  }

  const signer = await provider.getSigner();
  return { provider, signer };
}

export function getContract(signerOrProvider, abi) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set");
  }
  return new Contract(CONTRACT_ADDRESS, abi, signerOrProvider);
}
