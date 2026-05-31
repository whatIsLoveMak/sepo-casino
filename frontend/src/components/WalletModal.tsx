import { motion, AnimatePresence } from 'framer-motion'
import { useDisconnect, useAccount, useBalance } from 'wagmi'
import { useEffect } from 'react'
import { sepolia } from 'wagmi/chains'

export default function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.classList.toggle('modal-open', open)
    return () => { document.body.classList.remove('modal-open') }
  }, [open])
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ethBalance } = useBalance({ address, chainId: sepolia.id, query: { enabled: !!address } })

  const handleDisconnect = () => {
    disconnect()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />

          {/* Modal wrapper — handles centering */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 51,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              pointerEvents: 'all',
              width: 360,
              background: '#0a0812',
              border: '1px solid var(--border)',
            }}
          >
            {/* Gold top line */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d4a830, transparent)' }} />

            <div style={{ padding: '32px 32px 28px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                  <p className="label" style={{ marginBottom: 8 }}>Connected Wallet</p>
                  <p style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: 13, fontWeight: 300, letterSpacing: 1,
                    color: 'var(--text-primary)',
                  }}>
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                  </p>
                </div>
                <button onClick={onClose} style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: 18, lineHeight: 1, padding: 4,
                }}>
                  ×
                </button>
              </div>

              {/* Balance */}
              <div style={{
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: '20px 0', marginBottom: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <span className="label">Wallet Balance</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="font-num" style={{ fontSize: 22, color: 'var(--gold)' }}>
                    {ethBalance?.value != null ? (Number(ethBalance.value) / 1e18).toFixed(4) : '—'}
                  </span>
                  <span className="label">ETH</span>
                </div>
              </div>

              {/* Network */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <span className="label">Network</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3db870' }} />
                  <span className="label" style={{ color: 'var(--text-primary)', letterSpacing: 2 }}>Sepolia Testnet</span>
                </div>
              </div>

              {/* Disconnect */}
              <motion.button
                onClick={handleDisconnect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  padding: '12px',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: 10, fontWeight: 600, letterSpacing: 4,
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.borderColor = '#cc3333'
                  ;(e.target as HTMLElement).style.color = '#cc3333'
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.target as HTMLElement).style.color = 'var(--text-muted)'
                }}
              >
                Disconnect
              </motion.button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
