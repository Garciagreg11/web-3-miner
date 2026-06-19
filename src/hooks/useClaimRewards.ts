import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const MINING_CONTRACT_ADDRESS = '0xYourMiningSessionContractAddress' as const;
const ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "epoch", "type": "uint256" }],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export function useClaimRewards() {
  const { writeContract, data: hash, isPending: isTxSubmitting } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = (epoch: number) => {
    writeContract({
      address: MINING_CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'claimRewards',
      args: [BigInt(epoch)],
    });
  };

  return {
    claim,
    isClaimLoading: isTxSubmitting || isTxConfirming,
    isSuccess
  };
}
