const initialTarget = 2n ** 240n;        // example difficulty
const rewardPerShare = 1_000_000_000n;   // example reward per share

const miningSession = await MiningSession.deploy(
  rewardsVaultAddress,
  initialTarget,
  rewardPerShare
);
await miningSession.deployed();
console.log("MiningSession:", miningSession.address);
