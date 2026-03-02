"use client";

import { useAccount, useReadContract } from "wagmi";
import { GATEKEEPER_ADDRESS, VAULT_ADDRESS } from "@/lib/contracts";
import gatekeeperAbi from "@/lib/abi/gatekeeper";
import vaultAbi from "@/lib/abi/vault";
import SponsorGasForm from "@/components/SponsorGasForm";
import ConnectWallet from "@/components/ConnectWallet";

export default function GatekeeperDashboard() {
  const { address, isConnected } = useAccount();

  // Read: Vault balance
  const { data: vaultBalance } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: "getVaultBalance",
  });

  // Read: Daily limit
  const { data: dailyLimit } = useReadContract({
    address: GATEKEEPER_ADDRESS,
    abi: gatekeeperAbi,
    functionName: "dailyLimit",
  });

  // Read: Remaining gas
  const { data: remainingGas } = useReadContract({
    address: GATEKEEPER_ADDRESS,
    abi: gatekeeperAbi,
    functionName: "remainingGas",
  });

  return (
    <div className="p-8 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Gatekeeper Dashboard</h1>

      {!isConnected && (
        <div className="mb-6">
          <ConnectWallet />
        </div>
      )}

      {isConnected && (
        <>
          <div className="grid grid-cols-1 gap-6 mb-10">
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
              <h2 className="text-xl font-semibold mb-2">Vault Balance</h2>
              <p className="text-2xl font-mono">
                {vaultBalance ? `${vaultBalance.toString()} wei` : "Loading..."}
              </p>
            </div>

            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
              <h2 className="text-xl font-semibold mb-2">Daily Limit</h2>
              <p className="text-2xl font-mono">
                {dailyLimit ? dailyLimit.toString() : "Loading..."}
              </p>
            </div>

            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
              <h2 className="text-xl font-semibold mb-2">Remaining Gas</h2>
              <p className="text-2xl font-mono">
                {remainingGas ? remainingGas.toString() : "Loading..."}
              </p>
            </div>
          </div>

          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
            <h2 className="text-xl font-semibold mb-4">Sponsor Gas</h2>
            <SponsorGasForm />
          </div>
        </>
      )}
    </div>
  );
}
