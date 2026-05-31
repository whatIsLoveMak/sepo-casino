import { useState, useEffect, useRef } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { CASINO_ABI, CASINO_ADDRESS } from '../abi'
import SlotDrum from './SlotDrum'
import type { SlotDrumHandle } from './SlotDrum'
import DepositWithdrawModal from './DepositWithdrawModal'

type RollOutcome = { won: boolean; result: bigint; payout: bigint; prediction: bigint }

const QUICK_BETS = ['0.001', '0.01', '0.05', '0.1']

interface DiceGameProps {
  betAmount: string
  setBetAmount: (v: string) => void
  prediction: number
  setPrediction: (v: number) => void
  onRoll?: () => void
}

export default function DiceGame({ betAmount, setBetAmount, prediction, setPrediction, onRoll }: DiceGameProps) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [outcome, setOutcome] = useState<RollOutcome | null>(null)
  const [rolling, setRolling] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const drum0 = useRef<SlotDrumHandle>(null)
  const drum1 = useRef<SlotDrumHandle>(null)

  const { data: casinoBalance, refetch: refetchBalance } = useReadContract({
    address: CASINO_ADDRESS,
    abi: CASINO_ABI,
    functionName: 'playerBalance',
    args: [address!],
    query: { enabled: !!address, refetchInterval: 5000 },
  })

  const { writeContract: deposit, data: depositHash, isPending: depositPending } = useWriteContract()
  const { isLoading: depositLoading } = useWaitForTransactionReceipt({
    hash: depositHash,
    query: { enabled: !!depositHash },
    onReplaced: () => refetchBalance(),
  })

  const { data: odds } = useReadContract({
    address: CASINO_ADDRESS,
    abi: CASINO_ABI,
    functionName: 'getOdds',
    args: [BigInt(prediction)],
  })

  const { writeContract: roll, data: rollHash, isPending: rollPending, isError: rollError, reset } = useWriteContract()
  const { isLoading: rollLoading, isSuccess: rollSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: rollHash,
    query: { enabled: !!rollHash },
  })

  useEffect(() => {
    if (rollError && rolling) {
      setRolling(false)
      drum0.current?.reset()
      drum1.current?.reset()
      reset()
    }
  }, [rollError])

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

  const animateRoll = async (finalNumber: number, won: boolean) => {
    window.__rolling = true
    const d0 = Math.floor(finalNumber / 10)
    const d1 = finalNumber % 10
    await Promise.all([
      drum0.current?.spin(d0, won, 0),
      drum1.current?.spin(d1, won, 120),
    ])
    window.__rolling = false
    setRolling(false)
    reset()
    onRoll?.()
  }

  const handleRoll = () => {
    if (!betAmount) return
    setOutcome(null)
    drum0.current?.reset()
    drum1.current?.reset()
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
      <div className="result-area" style={{ padding: '48px 0 40px', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <SlotDrum ref={drum0} />
          <SlotDrum ref={drum1} />
        </div>

        <div style={{ height: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <AnimatePresence>
            {outcome && (
              <motion.p
                key="outcome"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="label"
                style={{ letterSpacing: 6, fontSize: 11, color: outcome.won ? 'var(--win)' : 'var(--loss-text)' }}
              >
                {outcome.won ? `WIN · +${formatEther(outcome.payout)} ETH` : 'LOSS'}
              </motion.p>
            )}
            {isBusy && !outcome && (
              <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="label" style={{ fontSize: 11, letterSpacing: 6 }}>
                WAITING…
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {rollHash && (
          <a href={`https://sepolia.etherscan.io/tx/${rollHash}`} target="_blank" rel="noreferrer"
            className="label" style={{ color: 'var(--gold)', opacity: 0.6, fontSize: 10, letterSpacing: 2 }}>
            View tx ↗
          </a>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Controls */}
      <div className="game-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, padding: '36px 0' }}>

        {/* Slider + odds */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span className="label">Win if roll ≤</span>
            <span className="font-num" style={{ fontSize: 36, color: 'var(--text-primary)' }}>{prediction}</span>
          </div>
          <input type="range" min={2} max={98} value={prediction}
            onChange={e => setPrediction(Number(e.target.value))}
            disabled={isBusy} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
            <span className="label" style={{ fontSize: 10 }}>Risky · 2</span>
            <span className="label" style={{ fontSize: 10 }}>98 · Safe</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Chance', value: `${winChance}%`, gold: false },
              { label: 'Multiplier', value: `${payoutMultiplier}×`, gold: true },
              { label: 'Payout', value: expectedPayout, gold: false },
            ].map(({ label, value, gold }) => (
              <div key={label} style={{ border: '1px solid var(--border)', padding: 12, textAlign: 'center' }}>
                <div className="label" style={{ marginBottom: 6 }}>{label}</div>
                <div className="font-num" style={{ fontSize: 17, color: gold ? 'var(--gold)' : 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bet + roll */}
        <div className="game-controls-bet">
          <div className="label" style={{ marginBottom: 10 }}>Bet Amount (ETH)</div>
          <input className="field-input" type="number" placeholder="0.01" min="0.001" max="0.5" step="0.001"
            value={betAmount} onChange={e => setBetAmount(e.target.value)} disabled={isBusy}
            style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {QUICK_BETS.map(v => (
              <button key={v} className="chip" onClick={() => setBetAmount(v)} disabled={isBusy}
                style={{
                  fontFamily: 'Helvetica Neue, sans-serif', fontSize: 10, letterSpacing: 1,
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

      <DepositWithdrawModal
        open={showDeposit}
        mode="deposit"
        balance={casinoBalance ? formatEther(casinoBalance) : '0'}
        amount={depositAmount}
        setAmount={setDepositAmount}
        onClose={() => setShowDeposit(false)}
        onDeposit={amount => deposit({ address: CASINO_ADDRESS, abi: CASINO_ABI, functionName: 'deposit', value: parseEther(amount) })}
        onWithdraw={() => {}}
        isDepositBusy={depositPending || depositLoading}
        isWithdrawBusy={false}
        depositHash={depositHash}
        depositLoading={depositLoading}
      />
    </div>
  )
}
