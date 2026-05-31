# Sepo Casino

An on-chain dice casino built on **Ethereum Sepolia** testnet. Every roll is a verifiable blockchain transaction — a paranoid player can confirm the result independently using a block explorer.

**Live:** https://casino-dice-sepolia.surge.sh  
**Contract:** [0xc263EBBBA7099B47FC083F8C3B9B7bc06253E913](https://sepolia.etherscan.io/address/0xc263ebbba7099b47fc083f8c3b9b7bc06253e913#code)

---

## What Works

- **Wallet connection** — MetaMask via custom connect modal
- **Deposit** — send Sepolia ETH into the casino contract; balance tracked on-chain
- **Dice game** — pick a prediction (2–98), set a bet, roll. Win if result ≤ prediction
- **Withdrawal** — pull your casino balance back to your wallet anytime
- **Verifiable randomness** — `keccak256(block.prevrandao, player, nonce, timestamp)`. All inputs visible on Etherscan; anyone can reproduce the result
- **House edge** — 2% (payout multiplier = 98 / prediction)
- **Demo mode** — play without connecting a wallet; uses simulated balance
- **Recent rolls history** — cached in localStorage, synced from chain on load
- **29 Foundry tests** — deposit, withdraw, roll validation, odds, owner functions

## What Doesn't Work

- **Randomness is not manipulation-proof** — validators could theoretically skip a block to influence `prevrandao`. Acceptable for a testnet demo; production would use Chainlink VRF or a commit-reveal scheme
- **No mobile layout** — optimized for desktop ≥ 1024px; burger menu hides secondary controls on smaller screens but the game layout is not fully responsive

## Why Ethereum

Solidity has a mature testing ecosystem (Foundry), rich tooling (wagmi, viem, RainbowKit), and Sepolia faucets are easy to use. The `block.prevrandao` randomness mechanic works well for a demo — it's verifiable without an oracle, which keeps the architecture simple and self-contained.

## Hardest Unknown

Getting **RainbowKit + wagmi v3 on React 19** to work. The standard connect modal threw a `border=0` error deep inside the `cuer` QR-code library — a bug where `border: 0` was hardcoded but the encoder requires `≥ 1`. Tracked it down to `node_modules/cuer/_dist/QrCode.js` and patched it in place. Ended up replacing the RainbowKit connect modal entirely with a custom one that calls `injected()` directly, which also fixed a silent MetaMask connection failure caused by wagmi using a different RPC method than a direct `window.ethereum.request()` call.

## What I'd Build Next

1. **Chainlink VRF** — replace `prevrandao` with a verifiable random function for true manipulation-resistance
2. **Multiple games** — roulette, coin flip, plinko — same deposit/withdraw model
3. **Leaderboard** — on-chain top winners via indexed events
4. **Mobile-first layout** — full responsive redesign
5. **State channels** — remove per-roll MetaMask confirmations; batch settle on withdrawal

---

## Stack

| Layer | Tech |
|---|---|
| Smart contract | Solidity 0.8.24, Foundry |
| Frontend | React 19, TypeScript, Vite 8 |
| Web3 | wagmi v3, viem, RainbowKit v2 |
| Styling | Tailwind v4, Framer Motion, custom canvas particles |
| Deploy | Surge.sh (frontend), Sepolia (contract) |

## Running Locally

```bash
# Frontend
cd frontend
nvm use 22.15.0
npm install --legacy-peer-deps
echo "VITE_CASINO_ADDRESS=0xc263EBBBA7099B47FC083F8C3B9B7bc06253E913" > .env
npm run dev

# Tests
cd contracts
forge test -v
```

## How I Used AI

Used Claude Code throughout — for initial contract design, frontend scaffolding, debugging the RainbowKit/cuer bug, writing Foundry tests, and iterating on the UI design through a visual brainstorming session. 

**What worked well:** fast iteration on UI components, catching TypeScript errors before they hit the browser, debugging obscure library bugs by reading minified source.

**What didn't work:** the AI occasionally suggested approaches that looked correct but had subtle wagmi v3 API mismatches — required manual verification against docs for anything version-specific.
