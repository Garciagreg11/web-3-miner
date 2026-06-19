import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

const MINING_CONTRACT_ADDRESS = '0xYourMiningSessionContractAddress' as const;
const ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "epoch", "type": "uint256" },
      { "internalType": "address", "name": "minerAddr", "type": "address" }
    ],
    "name": "pendingRewards",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function usePendingRewards(epoch: number, address?: `0x${string}`) {
  const { data: pendingData, refetch: refetchPending } = useReadContract({
    address: MINING_CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'pendingRewards',
    args: [BigInt(epoch), address!],
    query: { enabled: !!address },
  });

  return {
    pendingRewards: pendingData ? formatUnits(pendingData, 18) : '0.00',
    refetchPending
  };
}
