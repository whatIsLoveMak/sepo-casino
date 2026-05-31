import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SlotDrum from './SlotDrum'
import type { SlotDrumHandle } from './SlotDrum'

type RollOutcome = { won: boolean; result: number; payout: number }

const QUICK_BETS = ['0.001', '0.01', '0.05', '0.1']

interface DemoGameProps {
  balance: number
  setBalance: (b: number) => void
  betAmount: string
  setBetAmount: (v: string) => void
  prediction: number
  setPrediction: (v: number) => void
}

export default function DemoGame({ balance, setBalance, betAmount, setBetAmount, prediction, setPrediction }: DemoGameProps) {
  const [outcome, setOutcome] = useState<RollOutcome | null>(null)
  const [rolling, setRolling] = useState(false)
  const [history, setHistory] = useState<(RollOutcome & { prediction: number; bet: number })[]>(() => {
    try { return JSON.parse(localStorage.getItem('demo_history') ?? '[]') } catch { return [] }
  })
  const drum0 = useRef<SlotDrumHandle>(null)
  const drum1 = useRef<SlotDrumHandle>(null)

  const payoutMultiplier = parseFloat((98 / prediction).toFixed(2))
  const expectedPayout = betAmount ? parseFloat((parseFloat(betAmount) * payoutMultiplier).toFixed(4)) : 0

  const handleRoll = async () => {
    const bet = parseFloat(betAmount)
    if (!bet || bet > balance || rolling) return
    setOutcome(null)
    setRolling(true)

    await new Promise(r => setTimeout(r, 300))
    const result = Math.floor(Math.random() * 100) + 1
    const won = result <= prediction
    const payout = won ? parseFloat((bet * payoutMultiplier).toFixed(4)) : 0

    window.__rolling = true
    const d0 = Math.floor(result / 10)
    const d1 = result % 10
    await Promise.all([
      drum0.current?.spin(d0, won, 0),
      drum1.current?.spin(d1, won, 120),
    ])
    window.__rolling = false

    const r: RollOutcome = { won, result, payout }
    setOutcome(r)
    setHistory(h => {
      const updated = [{ ...r, prediction, bet }, ...h].slice(0, 10)
      try { localStorage.setItem('demo_history', JSON.stringify(updated)) } catch {}
      return updated
    })
    setBalance(won ? parseFloat((balance + payout - bet).toFixed(4)) : parseFloat((balance - bet).toFixed(4)))
    setRolling(false)
  }

  const bet = parseFloat(betAmount) || 0

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Result area */}
      <div className="result-area" style={{ padding: '48px 0 40px', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <SlotDrum ref={drum0} />
          <SlotDrum ref={drum1} />
        </div>
        <div style={{ height: 20, display: 'flex', alignItems: 'center' }}>
          <AnimatePresence>
            {outcome && (
              <motion.p key="outcome" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="label" style={{ letterSpacing: 6, fontSize: 11, color: outcome.won ? 'var(--win)' : 'var(--loss-text)' }}>
                {outcome.won ? `WIN · +${outcome.payout} ETH` : 'LOSS'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
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
            disabled={rolling} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
            <span className="label" style={{ fontSize: 10 }}>Risky · 2</span>
            <span className="label" style={{ fontSize: 10 }}>98 · Safe</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Chance', value: `${prediction}%`, gold: false },
              { label: 'Multiplier', value: `${payoutMultiplier}×`, gold: true },
              { label: 'Payout', value: expectedPayout.toFixed(4), gold: false },
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
            value={betAmount} onChange={e => setBetAmount(e.target.value)} disabled={rolling}
            style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {QUICK_BETS.map(v => (
              <button key={v} className="chip" onClick={() => setBetAmount(v)} disabled={rolling}
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
            disabled={rolling || !bet || bet > balance}
          >
            {rolling ? 'Rolling…' : 'Roll the Dice'}
          </motion.button>
          {bet > balance && (
            <p className="label" style={{ color: 'var(--loss-text)', marginTop: 8, fontSize: 10 }}>
              Insufficient demo balance
            </p>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, paddingBottom: 40 }}>
          <p className="label" style={{ marginBottom: 16 }}>Recent Rolls</p>
          <AnimatePresence initial={false}>
            {history.map((roll, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #0f0d14',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span className="font-num" style={{
                    fontSize: 20, width: 30, textAlign: 'center',
                    color: roll.won ? 'var(--text-primary)' : 'var(--loss-text)',
                  }}>
                    {roll.result}
                  </span>
                  <span className="label" style={{ letterSpacing: 1, fontSize: 10 }}>
                    {roll.bet} ETH · ≤{roll.prediction}
                  </span>
                </div>
                <span className="label" style={{
                  fontSize: 10, letterSpacing: 3,
                  color: roll.won ? 'var(--win)' : 'var(--loss-text)',
                }}>
                  {roll.won ? `WIN +${roll.payout}` : 'LOSS'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
