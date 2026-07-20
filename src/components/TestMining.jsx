import { useEffect } from "react";
import { useMining } from "../context/MiningContext";

export default function TestMining() {
  const { contract } = useMining();

  useEffect(() => {
    async function run() {
      if (!contract) return;

      try {
        const owner = await contract.owner();
        const me = await contract.signer.getAddress();
        const difficulty = await contract.difficulty();


        console.log("Contract Owner:", owner);
        console.log("Your Wallet:", me);
        console.log("Difficulty:", difficulty.toString());
      } catch (err) {
        console.error("Error reading contract data:", err);
      }
    }

    run();
  }, [contract]);

  return <div>Check console for owner, wallet, and difficulty.</div>;
}
