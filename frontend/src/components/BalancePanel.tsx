import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion, AnimatePresence } from 'framer-motion'
import { CASINO_ABI, CASINO_ADDRESS } from '../abi'
import WalletModal from './WalletModal'
import DepositWithdrawModal from './DepositWithdrawModal'

type ModalMode = 'deposit' | 'withdraw' | null

export default function BalanceHeader({ onDemo, onHome }: { onDemo?: () => void; onHome?: () => void }) {
  const { address } = useAccount()
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [modalAmount, setModalAmount] = useState("")
  const [burgerOpen, setBurgerOpen] = useState(false)

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
    hash: depositHash, query: { enabled: !!depositHash }, onReplaced: () => refetch(),
  })
  const { isLoading: withdrawLoading } = useWaitForTransactionReceipt({
    hash: withdrawHash, query: { enabled: !!withdrawHash }, onReplaced: () => refetch(),
  })

  const balance = casinoBalance ? formatEther(casinoBalance) : '0'
  const isDepositBusy = depositPending || depositLoading
  const isWithdrawBusy = withdrawPending || withdrawLoading

  const handleDeposit = (amount: string) => {
    deposit({ address: CASINO_ADDRESS, abi: CASINO_ABI, functionName: 'deposit', value: parseEther(amount) })
  }
  const handleWithdraw = (amount: string) => {
    withdraw({ address: CASINO_ADDRESS, abi: CASINO_ABI, functionName: 'withdraw', args: [parseEther(amount)] })
  }

  const closeBurger = () => setBurgerOpen(false)
  const openModal = (mode: ModalMode) => { setModalMode(mode); closeBurger() }

  const sidebarItems = (
    <ConnectButton.Custom>
      {({ openChainModal, account, chain, mounted }) => {
        if (!mounted) return null
        return (
          <>
            <button className="btn-outline btn-border" style={{ width: '100%', padding: '10px 16px', fontSize: 10, textAlign: 'left' }}
              onClick={() => { openModal('withdraw') }}>
              Withdraw
            </button>
            {onDemo && (
              <button onClick={() => { onDemo(); closeBurger() }} className="btn-border" style={{
                width: '100%', background: 'transparent', border: '1px solid var(--border)',
                color: '#ffffff', padding: '10px 16px',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 10, fontWeight: 600, letterSpacing: 3,
                textTransform: 'uppercase' as const, cursor: 'pointer', textAlign: 'left',
              }}>
                Demo
              </button>
            )}
            {account && (
              <>
                {chain?.unsupported && (
                  <button onClick={() => { openChainModal(); closeBurger() }} style={{
                    width: '100%', background: 'transparent', border: '1px solid var(--gold)',
                    color: 'var(--gold)', padding: '10px 16px', cursor: 'pointer',
                    fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, letterSpacing: 2, textAlign: 'left',
                  }}>
                    Wrong network
                  </button>
                )}
                <button onClick={() => { setShowWalletModal(true); closeBurger() }} className="btn-border" style={{
                  width: '100%', background: 'transparent', border: '1px solid var(--border)',
                  color: '#ffffff', padding: '10px 16px', cursor: 'pointer',
                  fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10,
                  fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'left',
                }}>
                  {account.displayName}
                </button>
              </>
            )}
          </>
        )
      }}
    </ConnectButton.Custom>
  )

  return (
    <>
      <header
        className="sticky top-0 z-10 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', padding: 12 }}
      >
        {/* Logo */}
        <button onClick={onHome} className="flex items-center gap-3"
          style={{ background: 'transparent', border: 'none', cursor: onHome ? 'pointer' : 'default' }}>
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>♠</span>
          <span className="font-serif header-casino-name" style={{ fontSize: 13, letterSpacing: 4, color: "var(--text-primary)" }}>
            SEPO CASINO
          </span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Balance — always visible */}
          <div className="flex items-baseline gap-2">
            <span className="font-num header-balance" style={{ fontSize: 20, color: "var(--gold)" }}>
              {parseFloat(balance).toFixed(4)}
            </span>
            <span className="label">ETH</span>
          </div>

          {/* Deposit — always visible */}
          <button className="btn-primary btn-gold" style={{ padding: '6px 16px', fontSize: 10 }}
            onClick={() => setModalMode('deposit')}>
            Deposit
          </button>

          {/* Desktop-only buttons */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn-outline btn-border" style={{ padding: '6px 16px', fontSize: 10 }}
              onClick={() => setModalMode('withdraw')}>
              Withdraw
            </button>

            {onDemo && (
              <button onClick={onDemo} className="btn-border" style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: '#ffffff', padding: '6px 14px',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 10, fontWeight: 600, letterSpacing: 3,
                textTransform: 'uppercase' as const, cursor: 'pointer',
              }}>
                Demo
              </button>
            )}

            <ConnectButton.Custom>
              {({ openChainModal, account, chain, mounted }) => {
                if (!mounted || !account) return null
                return (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {chain?.unsupported && (
                      <button onClick={openChainModal} style={{
                        background: 'transparent', border: '1px solid var(--gold)',
                        color: 'var(--gold)', padding: '6px 14px', cursor: 'pointer',
                        fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, letterSpacing: 2,
                      }}>
                        Wrong network
                      </button>
                    )}
                    <button onClick={() => setShowWalletModal(true)} className="btn-border" style={{
                      background: 'transparent', border: '1px solid var(--border)',
                      color: '#ffffff', padding: '6px 14px', cursor: 'pointer',
                      fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10,
                      fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
                    }}>
                      {account.displayName}
                    </button>
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>

          {/* Burger button — mobile/tablet only */}
          <button
            className="burger-btn"
            onClick={() => setBurgerOpen(v => !v)}
            style={{
              display: 'none', background: 'transparent', border: '1px solid var(--border)',
              color: '#ffffff', padding: '6px 10px', cursor: 'pointer',
              fontFamily: "'Helvetica Neue', sans-serif", fontSize: 14, lineHeight: 1,
            }}
          >
            {burgerOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Sidebar overlay */}
      <AnimatePresence>
        {burgerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeBurger}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            />
            <motion.div
              key="sidebar"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 260,
                background: '#0a0812', borderLeft: '1px solid var(--border)',
                zIndex: 41, display: 'flex', flexDirection: 'column', padding: 24, gap: 12,
              }}
            >
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d4a830, transparent)', marginBottom: 12 }} />
              {sidebarItems}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <DepositWithdrawModal
        open={modalMode !== null}
        mode={modalMode ?? 'deposit'}
        balance={balance}
        amount={modalAmount}
        setAmount={setModalAmount}
        onClose={() => setModalMode(null)}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        isDepositBusy={isDepositBusy}
        isWithdrawBusy={isWithdrawBusy}
        depositHash={depositHash}
        withdrawHash={withdrawHash}
        depositLoading={depositLoading}
        withdrawLoading={withdrawLoading}
      />
      <WalletModal open={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </>
  )
}
