export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532);

if (!CONTRACT_ADDRESS) {
  console.warn("NEXT_PUBLIC_CONTRACT_ADDRESS is missing");
}
