// src/hooks/useGetWork.ts
import { useReadContract } from 'wagmi'
import { MINING_SESSION } from '../addresses'
import MiningSessionABI from '../abi/MiningSession.json'

export function useGetWork(miner: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: MINING_SESSION,
    abi: MiningSessionABI.abi,
    functionName: 'getWork',
    args: miner ? [miner] : undefined,
    query: { enabled: !!miner }
  })

  return {
    epoch: data?.[0],
    difficulty: data?.[1],
    target: data?.[2],
    isLoading,
    refetch
  }
}
