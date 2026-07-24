import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { base } from 'wagmi/chains';

const { chainId } = useAccount();
const { switchChain } = useSwitchChain();
const { writeContract } = useWriteContract();

const handleSubmitShare = async (nonce) => {
  // Ensure user is on Base before writing to contract
  if (chainId !== base.id) {
    await switchChain({ chainId: base.id });
  }

  writeContract({
    address: '0x41c1ce19f1b8774f27E1E38E17b50cB02A32E4FA',
    abi: contractAbi,
    functionName: 'submitShare',
    args: [nonce],
    chain: base,
  });
};
