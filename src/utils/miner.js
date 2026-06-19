let miningLoop = null;

// Core mining loop
export function mine(setHashrate, setLastShare) {
  if (miningLoop) return;
  miningLoop = setInterval(() => {
    const hr = Math.floor(Math.random() * 9000 + 1000);
    setHashrate(hr);
    if (Math.random() < 0.1) {
      setLastShare(Date.now());
      console.log("Share submitted");
    }
  }, 1000);
}

export function startMiner(setHashrate, setLastShare) {
  mine(setHashrate, setLastShare);
}

export function stopMiner() {
  if (miningLoop) {
    clearInterval(miningLoop);
    miningLoop = null;
  }
}
