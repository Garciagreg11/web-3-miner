// src/mining-worker.js
import { keccak256, encodePacked } from "viem";

let isMining = false;

// 🛠️ FRONTEND TUNING CONTROLLER
// CHANGED: Massively boosted to 120000n to finally force a slower pace on high-end GPUs.
// This severely restricts the target window to shift your pace cleanly out to 12-15+ seconds.
const DIFFICULTY_MULTIPLIER = 120000n;

self.onmessage = async (event) => {
  const msg = event.data;

  if (msg.type === "start") {
    isMining = true;
    const minerAddress = msg.miner;
    const currentEpoch = BigInt(msg.epoch);

    // Adjust target by our difficulty multiplier to throttle rapid share submissions
    const targetValue = BigInt(msg.target) / DIFFICULTY_MULTIPLIER;

    // Start with a randomized nonce to optimize thread performance
    let nonce = BigInt(Math.floor(Math.random() * 100000000));
    let hashesCount = 0;
    let lastReportTime = performance.now();

    while (isMining) {
      // Flawless secure alignment: hash matches the smart contract expectations exactly
      const hashString = keccak256(
        encodePacked(
          ["address", "uint256", "uint256"],
          [minerAddress, currentEpoch, nonce]
        )
      );

      const hashBigInt = BigInt(hashString);

      // Verify if the computed hash beats the newly tuned local difficulty target
      if (hashBigInt < targetValue) {
        self.postMessage({
          type: "share",
          nonce: nonce.toString(),
          hash: hashString,
        });
      }

      nonce++;
      hashesCount++;

      // Report running speed back to UI every 1 second
      const now = performance.now();
      if (now - lastReportTime >= 1000) {
        const timePassed = (now - lastReportTime) / 1000;
        const hashrate = Math.floor(hashesCount / timePassed);

        self.postMessage({ type: "hashrate", hashrate });

        hashesCount = 0;
        lastReportTime = now;
      }

      // Briefly yield execution loop to prevent browser tab freeze
      if (nonce % 500n === 0n) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  if (msg.type === "stop") {
    isMining = false;
  }
};
