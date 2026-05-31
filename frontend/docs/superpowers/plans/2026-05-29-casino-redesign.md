# Casino Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign SepoCasino frontend into a premium dark-luxury casino with particle hero, Framer Motion animations, and full-width game layout.

**Architecture:** Two distinct modes (Landing / Game) wrapped in Framer Motion `AnimatePresence` for fade transition. Landing has Vanta.js NET particle background. Game mode puts balance controls in a sticky header and the dice game full-width below.

**Tech Stack:** React 19, Tailwind v4, wagmi v3, Framer Motion, Vanta.js + Three.js, Google Fonts (Cormorant Garamond)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/index.css` | Modify | Design tokens, Cormorant Garamond import, utility classes |
| `src/components/ParticleBackground.tsx` | Create | Vanta NET wrapper component |
| `src/App.tsx` | Modify | Two-mode layout, AnimatePresence, new Header |
| `src/components/BalancePanel.tsx` | Modify | Inline header controls (no panel) |
| `src/components/DiceGame.tsx` | Modify | Full-width layout, Framer Motion roll animation |
| `src/components/History.tsx` | Modify | Full-width rows, animated entry |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install framer-motion, vanta, three**

```bash
cd ~/WebstormProjects/casino/frontend
nvm use 22.15.0
npm install framer-motion vanta three --legacy-peer-deps
npm install --save-dev @types/three --legacy-peer-deps
```

Expected: packages added to `node_modules`, no errors.

- [ ] **Step 2: Verify build still works**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built in` with no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add framer-motion, vanta, three"
```

---

### Task 2: Design tokens & fonts

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace index.css with new design system**

Replace the entire contents of `src/index.css` with:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base: #05050a;
  --bg-surface: #0a0812;
  --text-primary: #e8e0d0;
  --text-muted: #444444;
  --text-dim: #2a2530;
  --gold: #d4a830;
  --gold-hover: #f0c040;
  --win: #3db870;
  --loss-text: #2a1520;
  --border: #1a1520;
  --border-surface: #2a2030;
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
}

#root { min-height: 100vh; }

/* Serif utility */
.font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

/* Label utility — small uppercase tracking */
.label {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 9px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--text-muted);
}

@utility card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 1.5rem;
}

@utility btn-primary {
  background-color: var(--gold);
  color: #000;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 4px;
  text-transform: uppercase;
  padding: 0.75rem 1.5rem;
  border: none;
  cursor: pointer;
  display: inline-block;
  text-align: center;
  transition: background 150ms;

  &:hover { background-color: var(--gold-hover); }
  &:active { filter: brightness(0.95); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

@utility btn-outline {
  border: 1px solid var(--border-surface);
  color: var(--text-primary);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 0.75rem 1.5rem;
  background: transparent;
  cursor: pointer;
  display: inline-block;
  text-align: center;
  transition: border-color 150ms;

  &:hover { border-color: var(--gold); color: var(--gold); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

@utility field-input {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-surface);
  border-radius: 2px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  width: 100%;
  outline: none;
  transition: border-color 150ms;

  &:focus { border-color: var(--gold); }
}

/* Range slider gold styling */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 2px;
  background: var(--border);
  cursor: pointer;
  outline: none;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--gold);
  cursor: grab;
}
input[type='range']:disabled { opacity: 0.4; cursor: not-allowed; }
input[type='range']:disabled::-webkit-slider-thumb { cursor: not-allowed; }
```

- [ ] **Step 2: Start dev server and verify fonts load**

```bash
nvm use 22.15.0 && npm run dev &
```

Open http://localhost:5173 — page should show dark bg, Cormorant Garamond loaded (check Network tab for fonts.googleapis.com request).

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: premium design tokens and Cormorant Garamond font"
```

---

### Task 3: ParticleBackground component

**Files:**
- Create: `src/components/ParticleBackground.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/ParticleBackground.tsx
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    VANTA: any
    THREE: any
  }
}

export default function ParticleBackground() {
  const ref = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vantaRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const THREE = await import('three')
      window.THREE = THREE

      const VANTA = await import('vanta/dist/vanta.net.min')

      if (cancelled || !ref.current) return

      vantaRef.current = VANTA.default({
        el: ref.current,
        THREE,
        color: 0xd4a830,
        backgroundColor: 0x05050a,
        points: 8,
        maxDistance: 22,
        spacing: 18,
        showDots: true,
      })
    }

    init()

    return () => {
      cancelled = true
      vantaRef.current?.destroy()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/ParticleBackground.tsx
git commit -m "feat: Vanta NET particle background component"
```

---

### Task 4: Redesign App.tsx — two modes with AnimatePresence

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx**

```tsx
// src/App.tsx
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { AnimatePresence, motion } from 'framer-motion'
import ParticleBackground from './components/ParticleBackground'
import BalanceHeader from './components/BalancePanel'
import DiceGame from './components/DiceGame'
import History from './components/History'

function Landing() {
  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen flex flex-col"
    >
      <ParticleBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-10 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--gold)', fontSize: 20 }}>♠</span>
          <span className="font-serif" style={{ fontSize: 13, letterSpacing: 5, color: 'var(--text-primary)' }}>
            SEPO CASINO
          </span>
        </div>
        <span className="label">Sepolia Testnet</span>
      </header>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <p className="label" style={{ color: 'var(--gold)', letterSpacing: 6, marginBottom: 24 }}>
          On-chain · Verifiable · Non-custodial
        </p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 16 }}>
          Roll the dice.<br />
          <em style={{ color: 'var(--gold)' }}>Own the odds.</em>
        </h1>
        <p className="label" style={{ marginBottom: 48 }}>Ethereum Sepolia Testnet</p>

        <ConnectButton />

        <div className="flex gap-16 mt-16 pt-10" style={{ borderTop: '1px solid var(--border)' }}>
          {[['2%', 'House Edge'], ['49×', 'Max Payout'], ['0.001', 'Min Bet ETH']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="font-serif" style={{ fontSize: 28, color: 'var(--gold)' }}>{val}</div>
              <div className="label" style={{ marginTop: 6 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Game() {
  return (
    <motion.div
      key="game"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)' }}
    >
      <BalanceHeader />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 40px', width: '100%' }}>
        <DiceGame />
        <History />
      </main>
    </motion.div>
  )
}

export default function App() {
  const { isConnected } = useAccount()

  return (
    <AnimatePresence mode="wait">
      {isConnected ? <Game key="game" /> : <Landing key="landing" />}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Check for type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Verify in browser**

Open http://localhost:5173 — landing page shows with particle background and hero text. ConnectButton visible.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: two-mode layout with AnimatePresence transition"
```

---

### Task 5: BalancePanel → BalanceHeader

**Files:**
- Modify: `src/components/BalancePanel.tsx`

- [ ] **Step 1: Replace BalancePanel with inline header component**

```tsx
// src/components/BalancePanel.tsx
import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CASINO_ABI, CASINO_ADDRESS } from '../abi'

export default function BalanceHeader() {
  const { address } = useAccount()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const { data: casinoBalance, refetch } = useReadContract({
    address: CASINO_ADDRESS,
    abi: CASINO_ABI,
    functionName: 'playerBalance',
    args: [address!],
    query: { enabled: !!address, refetchInterval: 5000 },
  })

  const { writeContract: deposit, data: depositHash, isPending: depositPending } = useWriteContract()
  const { writeContract: withdraw, data: withdrawHash, isPending: withdrawPending } = useWriteContract()

  const { isLoading: depositLoading } = useWaitForTransactionReceipt({
    hash: depositHash,
    query: { enabled: !!depositHash },
    onReplaced: () => refetch(),
  })
  const { isLoading: withdrawLoading } = useWaitForTransactionReceipt({
    hash: withdrawHash,
    query: { enabled: !!withdrawHash },
    onReplaced: () => refetch(),
  })

  const balance = casinoBalance ? formatEther(casinoBalance) : '0'
  const isDepositBusy = depositPending || depositLoading
  const isWithdrawBusy = withdrawPending || withdrawLoading

  const handleDeposit = () => {
    if (!depositAmount) return
    deposit({ address: CASINO_ADDRESS, abi: CASINO_ABI, functionName: 'deposit', value: parseEther(depositAmount) })
    setDepositAmount('')
    setShowDeposit(false)
  }

  const handleWithdraw = () => {
    if (!withdrawAmount) return
    withdraw({ address: CASINO_ADDRESS, abi: CASINO_ABI, functionName: 'withdraw', args: [parseEther(withdrawAmount)] })
    setWithdrawAmount('')
    setShowWithdraw(false)
  }

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-10 py-3"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span style={{ color: 'var(--gold)', fontSize: 18 }}>♠</span>
        <span className="font-serif" style={{ fontSize: 13, letterSpacing: 4, color: 'var(--text-primary)' }}>
          SEPO CASINO
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Balance */}
        <div className="flex items-baseline gap-2">
          <span className="font-serif" style={{ fontSize: 20, color: 'var(--gold)' }}>
            {parseFloat(balance).toFixed(4)}
          </span>
          <span className="label">ETH</span>
        </div>

        {/* Deposit */}
        <div className="relative">
          <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 10 }}
            onClick={() => { setShowDeposit(v => !v); setShowWithdraw(false) }}>
            Deposit
          </button>
          {showDeposit && (
            <div className="absolute right-0 top-full mt-2 p-4 flex flex-col gap-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', width: 200, zIndex: 20 }}>
              <input className="field-input" type="number" placeholder="0.01" min="0.001" step="0.001"
                value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
              <button className="btn-primary w-full" onClick={handleDeposit} disabled={isDepositBusy || !depositAmount}>
                {isDepositBusy ? 'Depositing…' : 'Confirm'}
              </button>
              {depositHash && (
                <a href={`https://sepolia.etherscan.io/tx/${depositHash}`} target="_blank" rel="noreferrer"
                  className="text-xs" style={{ color: 'var(--gold)', fontSize: 10 }}>
                  {depositLoading ? 'Confirming…' : 'View tx ↗'}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Withdraw */}
        <div className="relative">
          <button className="btn-outline" style={{ padding: '6px 16px', fontSize: 10 }}
            onClick={() => { setShowWithdraw(v => !v); setShowDeposit(false) }}>
            Withdraw
          </button>
          {showWithdraw && (
            <div className="absolute right-0 top-full mt-2 p-4 flex flex-col gap-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', width: 200, zIndex: 20 }}>
              <input className="field-input" type="number" placeholder="0.01" min="0" step="0.001"
                value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              <button className="btn-outline w-full" onClick={() => setWithdrawAmount(balance)}>Max</button>
              <button className="btn-primary w-full" onClick={handleWithdraw}
                disabled={isWithdrawBusy || !withdrawAmount || parseFloat(withdrawAmount) <= 0}>
                {isWithdrawBusy ? 'Withdrawing…' : 'Confirm'}
              </button>
              {withdrawHash && (
                <a href={`https://sepolia.etherscan.io/tx/${withdrawHash}`} target="_blank" rel="noreferrer"
                  style={{ color: 'var(--gold)', fontSize: 10 }}>
                  {withdrawLoading ? 'Confirming…' : 'View tx ↗'}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Wallet */}
        <ConnectButton showBalance={false} />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Verify in browser — connect wallet and check header**

Wallet address + balance appear in header. Deposit/Withdraw buttons open dropdowns.

- [ ] **Step 4: Commit**

```bash
git add src/components/BalancePanel.tsx
git commit -m "feat: balance panel moved to sticky header with dropdown controls"
```

---

### Task 6: Redesign DiceGame — full-width + Framer Motion

**Files:**
- Modify: `src/components/DiceGame.tsx`

- [ ] **Step 1: Replace DiceGame.tsx**

```tsx
// src/components/DiceGame.tsx
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { motion, useAnimate, AnimatePresence } from 'framer-motion'
import { CASINO_ABI, CASINO_ADDRESS } from '../abi'

type RollOutcome = { won: boolean; result: bigint; payout: bigint; prediction: bigint }

const QUICK_BETS = ['0.001', '0.01', '0.05', '0.1']

export default function DiceGame() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [prediction, setPrediction] = useState(50)
  const [betAmount, setBetAmount] = useState('0.01')
  const [outcome, setOutcome] = useState<RollOutcome | null>(null)
  const [rolling, setRolling] = useState(false)
  const [displayNumber, setDisplayNumber] = useState<number | null>(null)
  const [scope, animate] = useAnimate()

  const { data: odds } = useReadContract({
    address: CASINO_ADDRESS,
    abi: CASINO_ABI,
    functionName: 'getOdds',
    args: [BigInt(prediction)],
  })

  const { writeContract: roll, data: rollHash, isPending: rollPending, reset } = useWriteContract()
  const { isLoading: rollLoading, isSuccess: rollSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: rollHash,
    query: { enabled: !!rollHash },
  })

  useEffect(() => {
    if (!rollSuccess || !receipt || !publicClient) return
    const fetchLogs = async () => {
      const logs = await publicClient.getLogs({
        address: CASINO_ADDRESS,
        event: {
          type: 'event', name: 'RollResult',
          inputs: [
            { name: 'player', type: 'address', indexed: true },
            { name: 'betAmount', type: 'uint256', indexed: false },
            { name: 'prediction', type: 'uint256', indexed: false },
            { name: 'result', type: 'uint256', indexed: false },
            { name: 'won', type: 'bool', indexed: false },
            { name: 'payout', type: 'uint256', indexed: false },
          ],
        },
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      })
      const myLog = logs.find(l => (l.args as { player?: string }).player?.toLowerCase() === address?.toLowerCase())
      if (myLog) {
        const args = myLog.args as { won: boolean; result: bigint; payout: bigint; prediction: bigint }
        setOutcome({ won: args.won, result: args.result, payout: args.payout, prediction: args.prediction })
        animateRoll(Number(args.result), args.won)
      }
      setRolling(false)
      reset()
    }
    fetchLogs()
  }, [rollSuccess, receipt])

  const animateRoll = (finalNumber: number, won: boolean) => {
    let count = 0
    const interval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 100) + 1)
      count++
      if (count > 20) {
        clearInterval(interval)
        setDisplayNumber(finalNumber)
        if (won && scope.current) {
          animate(scope.current, { scale: [1, 1.06, 1] }, { duration: 0.4, ease: 'easeOut' })
        }
      }
    }, 60)
  }

  const handleRoll = () => {
    if (!betAmount) return
    setOutcome(null)
    setDisplayNumber(null)
    setRolling(true)
    roll({ address: CASINO_ADDRESS, abi: CASINO_ABI, functionName: 'roll', args: [BigInt(prediction), parseEther(betAmount)] })
  }

  const winChance = odds ? Number(odds[0]) : prediction
  const payoutMultiplier = odds ? (Number(odds[1]) / 100).toFixed(2) : (98 / prediction).toFixed(2)
  const expectedPayout = betAmount ? (parseFloat(betAmount) * parseFloat(payoutMultiplier)).toFixed(4) : '0'
  const isBusy = rollPending || rollLoading || rolling

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Result area */}
      <div className="text-center" style={{ padding: '48px 0 40px' }}>
        <AnimatePresence mode="wait">
          {isBusy && displayNumber === null ? (
            <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="label" style={{ fontSize: 11, letterSpacing: 6 }}>
              WAITING FOR TRANSACTION…
            </motion.p>
          ) : displayNumber !== null ? (
            <motion.div key="result" ref={scope} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div
                className="font-serif"
                style={{
                  fontSize: 140,
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: -4,
                  marginBottom: 12,
                  color: outcome?.won ? 'var(--gold)' : 'var(--text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {displayNumber}
              </div>
              {outcome && (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="label" style={{ letterSpacing: 6, color: outcome.won ? 'var(--win)' : 'var(--loss-text)', fontSize: 11 }}>
                  {outcome.won ? `WIN · +${formatEther(outcome.payout)} ETH` : 'LOSS'}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="font-serif" style={{ fontSize: 140, fontWeight: 300, lineHeight: 1, color: 'var(--border)', letterSpacing: -4 }}>
                —
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {rollHash && (
          <a href={`https://sepolia.etherscan.io/tx/${rollHash}`} target="_blank" rel="noreferrer"
            className="label" style={{ color: 'var(--gold)', opacity: 0.6, fontSize: 9, letterSpacing: 2 }}>
            View tx ↗
          </a>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, padding: '36px 0' }}>

        {/* Slider + odds */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span className="label">Win if roll ≤</span>
            <span className="font-serif" style={{ fontSize: 36, color: 'var(--text-primary)' }}>{prediction}</span>
          </div>
          <input type="range" min={2} max={98} value={prediction}
            onChange={e => setPrediction(Number(e.target.value))}
            disabled={isBusy} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
            <span className="label" style={{ fontSize: 8 }}>Risky · 2</span>
            <span className="label" style={{ fontSize: 8 }}>98 · Safe</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Chance', value: `${winChance}%`, gold: false },
              { label: 'Multiplier', value: `${payoutMultiplier}×`, gold: true },
              { label: 'Payout', value: expectedPayout, gold: false },
            ].map(({ label, value, gold }) => (
              <div key={label} style={{ border: '1px solid var(--border)', padding: 12, textAlign: 'center' }}>
                <div className="label" style={{ marginBottom: 6 }}>{label}</div>
                <div className="font-serif" style={{ fontSize: 17, color: gold ? 'var(--gold)' : 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bet + roll */}
        <div>
          <div className="label" style={{ marginBottom: 10 }}>Bet Amount (ETH)</div>
          <input className="field-input" type="number" placeholder="0.01" min="0.001" max="0.5" step="0.001"
            value={betAmount} onChange={e => setBetAmount(e.target.value)} disabled={isBusy}
            style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {QUICK_BETS.map(v => (
              <button key={v} onClick={() => setBetAmount(v)} disabled={isBusy}
                style={{
                  fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: 1,
                  padding: '5px 10px', background: 'transparent', cursor: 'pointer',
                  border: `1px solid ${betAmount === v ? 'var(--gold)' : 'var(--border)'}`,
                  color: betAmount === v ? 'var(--gold)' : 'var(--text-muted)',
                }}>
                {v}
              </button>
            ))}
          </div>

          <motion.button
            className="btn-primary w-full"
            style={{ padding: '14px', fontSize: 11, letterSpacing: 5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRoll}
            disabled={isBusy || !betAmount}
          >
            {isBusy ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg className="animate-spin" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Rolling…
              </span>
            ) : 'Roll the Dice'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Test visually**

Connect wallet → game mode appears. Idle state shows `—` in serif. Roll button has hover/tap animation.

- [ ] **Step 4: Commit**

```bash
git add src/components/DiceGame.tsx
git commit -m "feat: full-width DiceGame with Framer Motion result animation"
```

---

### Task 7: Redesign History — full-width animated rows

**Files:**
- Modify: `src/components/History.tsx`

- [ ] **Step 1: Replace History.tsx**

```tsx
// src/components/History.tsx
import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { CASINO_ADDRESS } from '../abi'

type Roll = { txHash: string; blockNumber: bigint; betAmount: bigint; prediction: bigint; result: bigint; won: boolean; payout: bigint }

const ROLL_EVENT = {
  type: 'event' as const, name: 'RollResult' as const,
  inputs: [
    { name: 'player', type: 'address' as const, indexed: true as const },
    { name: 'betAmount', type: 'uint256' as const, indexed: false as const },
    { name: 'prediction', type: 'uint256' as const, indexed: false as const },
    { name: 'result', type: 'uint256' as const, indexed: false as const },
    { name: 'won', type: 'bool' as const, indexed: false as const },
    { name: 'payout', type: 'uint256' as const, indexed: false as const },
  ],
}

export default function History() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [rolls, setRolls] = useState<Roll[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address || !publicClient) return
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const logs = await publicClient.getLogs({
          address: CASINO_ADDRESS, event: ROLL_EVENT,
          args: { player: address }, fromBlock: BigInt(0), toBlock: 'latest',
        })
        setRolls(logs.slice(-10).reverse().map(l => ({
          txHash: l.transactionHash ?? '',
          blockNumber: l.blockNumber ?? BigInt(0),
          betAmount: (l.args as { betAmount: bigint }).betAmount,
          prediction: (l.args as { prediction: bigint }).prediction,
          result: (l.args as { result: bigint }).result,
          won: (l.args as { won: boolean }).won,
          payout: (l.args as { payout: bigint }).payout,
        })))
      } catch (e) { console.error('History fetch error', e) }
      setLoading(false)
    }
    fetchHistory()
    const unwatch = publicClient.watchEvent({
      address: CASINO_ADDRESS, event: ROLL_EVENT,
      args: { player: address }, onLogs: () => fetchHistory(),
    })
    return () => unwatch()
  }, [address, publicClient])

  if (loading && !rolls.length) return null

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, paddingBottom: 40 }}>
      <p className="label" style={{ marginBottom: 16 }}>Recent Rolls</p>

      {!rolls.length ? (
        <p className="label" style={{ color: 'var(--border)', letterSpacing: 2 }}>No rolls yet — make your first bet.</p>
      ) : (
        <div>
          <AnimatePresence initial={false}>
            {rolls.map(roll => (
              <motion.div
                key={roll.txHash}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #0f0d14',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span className="font-serif" style={{
                    fontSize: 20, width: 30, textAlign: 'center',
                    color: roll.won ? 'var(--text-primary)' : 'var(--loss-text)',
                  }}>
                    {Number(roll.result)}
                  </span>
                  <span className="label" style={{ letterSpacing: 1, fontSize: 9 }}>
                    {formatEther(roll.betAmount)} ETH · ≤{Number(roll.prediction)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="label" style={{
                    fontSize: 8, letterSpacing: 3,
                    color: roll.won ? 'var(--win)' : 'var(--loss-text)',
                  }}>
                    {roll.won ? `WIN` : 'LOSS'}
                  </span>
                  {roll.txHash && (
                    <a href={`https://sepolia.etherscan.io/tx/${roll.txHash}`} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--text-dim)', fontSize: 11 }}>↗</a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/History.tsx
git commit -m "feat: full-width History with AnimatePresence row animations"
```

---

### Task 8: Build & deploy

**Files:** none

- [ ] **Step 1: Production build**

```bash
nvm use 22.15.0 && npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors.

- [ ] **Step 2: Deploy to Surge**

```bash
cd ~/WebstormProjects/casino/frontend
expect -c '
spawn npx surge dist casino-dice-sepolia.surge.sh
expect "email:"
send "mvv@trueflip.io\r"
expect "password:"
send "makaroff142\r"
expect eof
' 2>&1 | tail -5
```

Expected: `Success!` with domain `casino-dice-sepolia.surge.sh`.

- [ ] **Step 3: Verify live site**

```bash
curl -s -o /dev/null -w "%{http_code}" https://casino-dice-sepolia.surge.sh
```

Expected: `200`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: premium casino redesign complete"
```
