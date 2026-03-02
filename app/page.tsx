"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-10 space-y-16">
      {/* HERO */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold">
          Web 3 Miner
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          A browser‑based Proof‑of‑Work engine powered by Keccak‑256.
          Mine shares, earn rewards, and participate in a decentralized mining ecosystem —
          directly from your browser.
        </p>

        <Link
          href="/mine"
          className="inline-block px-8 py-4 bg-green-600 text-white rounded text-lg font-semibold"
        >
          Start Mining
        </Link>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          href="/mine"
          className="p-6 border rounded-lg hover:bg-gray-900 transition"
        >
          <h2 className="text-2xl font-bold mb-2">Mining Dashboard</h2>
          <p>Start mining instantly using your browser’s CPU. No installs, no setup.</p>
        </Link>

        <Link
          href="/rewards"
          className="p-6 border rounded-lg hover:bg-gray-900 transition"
        >
          <h2 className="text-2xl font-bold mb-2">Rewards</h2>
          <p>Track your pending rewards and claim them on‑chain anytime.</p>
        </Link>

        <Link
          href="/leaderboard"
          className="p-6 border rounded-lg hover:bg-gray-900 transition"
        >
          <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
          <p>See who’s mining the most shares in real time.</p>
        </Link>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold">How It Works</h2>

        <p>
          Web 3 Miner uses a lightweight Proof‑of‑Work algorithm based on Keccak‑256.
          Your browser searches for valid nonces that satisfy the difficulty target.
          When you find a valid share, it’s submitted to the smart contract and added to your total.
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Your browser mines using a Web Worker</li>
          <li>Valid shares are submitted on‑chain</li>
          <li>You earn rewards based on your total shares</li>
          <li>Difficulty and rewards are controlled by the admin panel</li>
        </ul>
      </section>
    </div>
  );
}
