import React, { createContext, useContext, useState, useEffect } from "react";
import { startMiner, stopMiner } from "../utils/miner";

const MiningContext = createContext(null);

export function MiningProvider({ children }) {
  const [mining, setMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [lastShare, setLastShare] = useState(null);

  useEffect(() => {
    if (!mining) return;
    const loop = setInterval(() => {
      const hr = Math.floor(Math.random() * 9000 + 1000);
      setHashrate(hr);
    }, 1000);
    return () => clearInterval(loop);
  }, [mining]);

  const startMining = () => {
    setMining(true);
    startMiner(setHashrate, setLastShare);
  };

  const stopMining = () => {
    setMining(false);
    stopMiner();
  };

  return (
    <MiningContext.Provider
      value={{ mining, hashrate, lastShare, startMining, stopMining }}
    >
      {children}
    </MiningContext.Provider>
  );
}

export function useMiner() {
  return useContext(MiningContext);
}
