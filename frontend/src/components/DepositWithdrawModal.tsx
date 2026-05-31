import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useBalance, useEstimateGas, useGasPrice } from 'wagmi'
import { parseEther } from 'viem'
import { sepolia } from 'wagmi/chains'
import { CASINO_ABI, CASINO_ADDRESS } from '../abi'

type Mode = 'deposit' | 'withdraw'

interface Props {
  open: boolean
  mode: Mode
  balance: string
  amount: string
  setAmount: (v: string) => void
  onClose: () => void
  onDeposit: (amount: string) => void
  onWithdraw: (amount: string) => void
  isDepositBusy: boolean
  isWithdrawBusy: boolean
  depositHash?: string
  withdrawHash?: string
  depositLoading?: boolean
  withdrawLoading?: boolean
}

const QUICK = ['0.001', '0.01', '0.05', '0.1']

export default function DepositWithdrawModal({
  open, mode, balance, amount, setAmount, onClose,
  onDeposit, onWithdraw,
  isDepositBusy, isWithdrawBusy,
  depositHash, withdrawHash,
  depositLoading, withdrawLoading,
}: Props) {
  const [tab, setTab] = useState<Mode>(mode)
  const { address } = useAccount()
  const { data: walletBalance } = useBalance({ address, chainId: sepolia.id, query: { enabled: !!address } })
  const walletEth = walletBalance?.value != null ? (Number(walletBalance.value) / 1e18).toFixed(4) : '—'

  const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseEther(amount as `${number}`) : undefined
  const { data: gasEstimate } = useEstimateGas({
    to: CASINO_ADDRESS,
    data: parsedAmount ? '0xd0e30db0' : undefined, // deposit() selector
    value: parsedAmount,
    query: { enabled: tab === 'deposit' && !!parsedAmount && !!address },
  })
  const { data: gasPrice } = useGasPrice({ chainId: sepolia.id, query: { enabled: tab === 'deposit' } })

  const gasCostEth = gasEstimate && gasPrice
    ? Number(gasEstimate * gasPrice) / 1e18
    : null
  const totalEth = parsedAmount && gasCostEth != null
    ? parseFloat(amount) + gasCostEth
    : null
  const insufficientFunds = totalEth != null && walletBalance?.value != null
    && totalEth > Number(walletBalance.value) / 1e18

  useEffect(() => {
    document.body.classList.toggle('modal-open', open)
    return () => { document.body.classList.remove('modal-open') }
  }, [open])

  useEffect(() => { setTab(mode) }, [mode])

  const isBusy = tab === 'deposit' ? isDepositBusy : isWithdrawBusy
  const hash = tab === 'deposit' ? depositHash : withdrawHash
  const loading = tab === 'deposit' ? depositLoading : withdrawLoading

  const MIN_DEPOSIT = '0.001'

  const handleAmountBlur = () => {
    if (tab === 'deposit' && amount && parseFloat(amount) < parseFloat(MIN_DEPOSIT)) {
      setAmount(MIN_DEPOSIT)
    }
  }

  const handleConfirm = () => {
    if (!amount) return
    const finalAmount = tab === 'deposit' && parseFloat(amount) < parseFloat(MIN_DEPOSIT)
      ? MIN_DEPOSIT
      : amount
    if (tab === 'deposit') onDeposit(finalAmount)
    else onWithdraw(finalAmount)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50 }}
          />

          <div style={{ position: 'fixed', inset: 0, zIndex: 51, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ pointerEvents: 'all', width: 360, background: '#0a0812', border: '1px solid var(--border)' }}
            >
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d4a830, transparent)' }} />

              <div style={{ padding: '28px 32px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: 20 }}>
                    {(['deposit', 'withdraw'] as Mode[]).map(t => (
                      <button key={t} onClick={() => { setTab(t); setAmount('') }} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                        fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, fontWeight: 700,
                        letterSpacing: 4, textTransform: 'uppercase',
                        color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                        borderBottom: tab === t ? '1px solid var(--gold)' : '1px solid transparent',
                        paddingBottom: 4,
                        transition: 'color 150ms',
                      }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
                </div>

                {/* Balance info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="label">{tab === 'deposit' ? 'Wallet Balance' : 'Casino Balance'}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="font-num" style={{ fontSize: 18, color: 'var(--gold)' }}>
                      {tab === 'deposit' ? walletEth : parseFloat(balance).toFixed(4)}
                    </span>
                    <span className="label">ETH</span>
                  </div>
                </div>

                {/* Amount input */}
                <div style={{ marginBottom: 12 }}>
                  <p className="label" style={{ marginBottom: 8 }}>Amount (ETH)</p>
                  <input
                    className="field-input"
                    type="number"
                    placeholder="0.01"
                    min="0.001"
                    step="0.001"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    onBlur={handleAmountBlur}
                    disabled={isBusy}
                  />
                </div>

                {/* Gas info (deposit only) */}
                {tab === 'deposit' && (
                  <div style={{ marginBottom: 12 }}>
                    {gasCostEth != null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="label" style={{ fontSize: 10, letterSpacing: 2 }}>Est. gas fee</span>
                        <span className="label" style={{ fontSize: 10, letterSpacing: 1, color: 'var(--text-primary)' }}>
                          ~{gasCostEth.toFixed(5)} ETH
                        </span>
                      </div>
                    )}
                    {totalEth != null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="label" style={{ fontSize: 10, letterSpacing: 2 }}>Total</span>
                        <span className="label" style={{ fontSize: 10, letterSpacing: 1, color: insufficientFunds ? 'var(--loss-text)' : 'var(--text-primary)' }}>
                          ~{totalEth.toFixed(5)} ETH {insufficientFunds ? '⚠ insufficient' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick amounts */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                  {(tab === 'withdraw' ? [...QUICK, 'MAX'] : QUICK).map(v => (
                    <button key={v} className="chip" onClick={() => setAmount(v === 'MAX' ? balance : v)} disabled={isBusy}
                      style={{
                        fontFamily: 'Helvetica Neue, sans-serif', fontSize: 10, letterSpacing: 1,
                        padding: '5px 10px', background: 'transparent', cursor: 'pointer',
                        border: `1px solid ${amount === (v === 'MAX' ? balance : v) ? 'var(--gold)' : 'var(--border)'}`,
                        color: amount === (v === 'MAX' ? balance : v) ? 'var(--gold)' : 'var(--text-muted)',
                      }}>
                      {v}
                    </button>
                  ))}
                </div>

                {/* Confirm button */}
                <motion.button
                  className="btn-gold"
                  onClick={handleConfirm}
                  disabled={isBusy || !amount}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', border: 'none', padding: '13px',
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontSize: 10, fontWeight: 700, letterSpacing: 4,
                    textTransform: 'uppercase', cursor: 'pointer', color: '#000',
                    opacity: isBusy || !amount ? 0.4 : 1,
                  }}
                >
                  {isBusy ? (tab === 'deposit' ? 'Depositing…' : 'Withdrawing…') : (tab === 'deposit' ? 'Deposit ETH' : 'Withdraw ETH')}
                </motion.button>

                {/* Tx link — absolutely positioned, doesn't push content */}
                <div style={{ position: 'relative', height: 0 }}>
                  {hash && (
                    <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer"
                      className="label" style={{
                        position: 'absolute', top: 10, left: 0, right: 0,
                        color: 'var(--gold)', textAlign: 'center', letterSpacing: 2,
                      }}>
                      {loading ? 'Confirming…' : 'View tx ↗'}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
