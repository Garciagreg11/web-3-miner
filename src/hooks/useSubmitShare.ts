// src/hooks/useSubmitShare.ts
import { useWriteContract } from 'wagmi'
import { MINING_SESSION } from '../addresses'
import MiningSessionABI from '../abi/MiningSession.json'

export function useSubmitShare() {
  const { writeContractAsync } = useWriteContract()

  async function submitShare(nonce: bigint) {
    return writeContractAsync({
      address: MINING_SESSION,
      abi: MiningSessionABI.abi,
      functionName: 'submitShare',
      args: [nonce]
    })
  }

  return { submitShare }
}
