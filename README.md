# Web 3 Miner

Web 3 Miner is a browser‑based Proof‑of‑Work engine powered by Keccak‑256.  
Users mine shares directly from their browser using a lightweight Web Worker, submit valid shares on‑chain, and earn rewards based on their mining performance.

This project demonstrates a decentralized mining model built entirely on Web3 primitives — no downloads, no GPU, no setup.

---

## 🚀 Features

### 🔹 Browser‑Based Mining
Your CPU mines Keccak‑256 nonces in real time using a Web Worker.  
Valid shares are submitted to the MiningSession contract.

### 🔹 On‑Chain Share Accounting
Each miner’s total shares are tracked on‑chain.  
Rewards are distributed proportionally.

### 🔹 Live Mining Dashboard
A real‑time mining interface shows:
- Current nonce
- Hashrate
- Valid shares submitted
- Mining status

### 🔹 Rewards System
Miners can:
- View pending rewards  
- Claim rewards on‑chain  
- Track their mining performance  

### 🔹 Leaderboard
A live leaderboard displays:
- Top miners  
- Total shares  
- Rankings  

### 🔹 Admin Panel
The operator can:
- Adjust difficulty  
- Adjust reward per share  
- Start new epochs  
- View current mining parameters  

---

## 📁 Project Structure

