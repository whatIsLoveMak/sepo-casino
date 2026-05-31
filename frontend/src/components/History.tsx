import { useEffect, useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'

type Roll = { txHash: string; blockNumber: string; betAmount: string; prediction: string; result: string; won: boolean; payout: string }

const cacheKey = (addr: string) => `history_${addr.toLowerCase()}`
function loadCache(addr: string): Roll[] {
  try { return JSON.parse(localStorage.getItem(cacheKey(addr)) ?? '[]') } catch { return [] }
}

export default function History({ refreshTrigger }: { refreshTrigger?: number }) {
  const { address } = useAccount()
  const [rolls, setRolls] = useState<Roll[]>(() => address ? loadCache(address) : [])

  useEffect(() => {
    if (address) setRolls(loadCache(address))
  }, [address])

  // Reload from cache whenever refreshTrigger changes (DiceGame saves after each roll)
  const reloadCache = useCallback(() => {
    if (address) setRolls(loadCache(address))
  }, [address])

  useEffect(() => {
    reloadCache()
  }, [reloadCache])

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      reloadCache()
    }
  }, [refreshTrigger, reloadCache])

  if (!rolls.length) return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, paddingBottom: 40 }}>
      <p className="label" style={{ marginBottom: 16 }}>Recent Rolls</p>
      <p className="label" style={{ color: 'var(--border)', letterSpacing: 2 }}>No rolls yet — make your first bet.</p>
    </div>
  )

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, paddingBottom: 40 }}>
      <p className="label" style={{ marginBottom: 16 }}>Recent Rolls</p>
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
                <span className="font-num" style={{
                  fontSize: 20, width: 30, textAlign: 'center',
                  color: roll.won ? 'var(--text-primary)' : 'var(--loss-text)',
                }}>
                  {Number(roll.result)}
                </span>
                <span className="label" style={{ letterSpacing: 1, fontSize: 10 }}>
                  {formatEther(BigInt(roll.betAmount))} ETH · ≤{Number(roll.prediction)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="label" style={{
                  fontSize: 10, letterSpacing: 3,
                  color: roll.won ? 'var(--win)' : 'var(--loss-text)',
                }}>
                  {roll.won ? 'WIN' : 'LOSS'}
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
    </div>
  )
}
