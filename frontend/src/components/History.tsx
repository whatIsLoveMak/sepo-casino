import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { CASINO_ADDRESS } from '../abi'

type Roll = { txHash: string; blockNumber: string; betAmount: string; prediction: string; result: string; won: boolean; payout: string }

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

const cacheKey = (address: string) => `history_${address.toLowerCase()}`

function loadCache(address: string): Roll[] {
  try { return JSON.parse(localStorage.getItem(cacheKey(address)) ?? '[]') } catch { return [] }
}

function saveCache(address: string, rolls: Roll[]) {
  try { localStorage.setItem(cacheKey(address), JSON.stringify(rolls)) } catch {}
}

export default function History({ refreshTrigger }: { refreshTrigger?: number }) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [rolls, setRolls] = useState<Roll[]>(() => address ? loadCache(address) : [])

  // Reload cache when address changes
  useEffect(() => {
    if (address) setRolls(loadCache(address))
  }, [address])

  useEffect(() => {
    if (!address || !publicClient || refreshTrigger === undefined) return
    // Force refresh when DiceGame signals a new roll
    fetchHistoryFn()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  const fetchHistoryFn = async () => {
    if (!address || !publicClient) return
    try {
      const latestBlock = await publicClient.getBlockNumber()
      const fromBlock = latestBlock > BigInt(50000) ? latestBlock - BigInt(50000) : BigInt(0)
      const logs = await publicClient.getLogs({
        address: CASINO_ADDRESS, event: ROLL_EVENT,
        args: { player: address }, fromBlock, toBlock: 'latest',
      })
      const parsed: Roll[] = logs.slice(-10).reverse().map(l => ({
        txHash: l.transactionHash ?? '',
        blockNumber: String(l.blockNumber ?? 0),
        betAmount: String((l.args as { betAmount: bigint }).betAmount),
        prediction: String((l.args as { prediction: bigint }).prediction),
        result: String((l.args as { result: bigint }).result),
        won: (l.args as { won: boolean }).won,
        payout: String((l.args as { payout: bigint }).payout),
      }))
      setRolls(parsed)
      saveCache(address, parsed)
    } catch {}
  }

  useEffect(() => {
    if (!address || !publicClient) return

    const fetchHistory = () => fetchHistoryFn()

    fetchHistory()
    const unwatch = publicClient.watchEvent({
      address: CASINO_ADDRESS, event: ROLL_EVENT,
      args: { player: address }, onLogs: () => fetchHistory(),
    })
    return () => unwatch()
  }, [address, publicClient])

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
