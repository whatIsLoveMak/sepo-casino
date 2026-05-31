import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnect, useAccount } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Browser extension',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M27.3 4L17.6 11.2l1.8-4.3L27.3 4z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.7 4l9.6 7.3-1.7-4.4L4.7 4z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23.7 21.6l-2.6 4 5.6 1.5 1.6-5.4-4.6-.1zM3.7 21.7l1.6 5.4 5.6-1.5-2.6-4-4.6.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.6 14.1l-1.5 2.3 5.4.2-.2-5.8-3.7 3.3zM21.4 14.1l-3.8-3.4-.1 5.9 5.4-.2-1.5-2.3zM10.9 25.6l3.2-1.6-2.8-2.2-.4 3.8zM17.9 24l3.2 1.6-.4-3.8-2.8 2.2z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21.1 25.6l-3.2-1.6.3 2.2v.9l2.9-1.5zM10.9 25.6l2.9 1.5v-.9l.2-2.2-3.1 1.6z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.8 20.7l-2.7-.8 1.9-.9.8 1.7zM18.2 20.7l.8-1.7 1.9.9-2.7.8z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.9 25.6l.4-4-2.9.1 2.5 3.9zM20.7 21.6l.4 4 2.5-3.9-2.9-.1zM23 16.4l-5.4.2.5 2.9.8-1.7 1.9.9 2.2-2.3zM11.1 18.7l1.9-.9.8 1.7.5-2.9-5.4-.2 2.2 2.3z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 16.4l2.3 4.4-.1-2.1L9 16.4zM20.8 18.7l-.2 2.1 2.4-4.4-2.2 2.3zM14.5 16.6l-.5 2.9.6 3.2.1-4.2-.2-1.9zM17.5 16.6l-.2 1.9.1 4.2.6-3.2-.5-2.9z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.2 20.7l-.6 3.2.4.3 2.8-2.2.2-2.1-2.8.8zM11.1 19.9l.1 2.1 2.8 2.2.4-.3-.6-3.2-2.7-.8z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.2 27.1v-.9l-.3-.2h-3.8l-.2.2v.9l-2.9-1.5 1 .8h4.2l1-.8-1 1.5z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.9 24l-.4-.3h-3l-.4.3-.2 2.2.2-.2h3.8l.3.2-.3-2.2z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M27.8 11.6l.8-4-1.3-3.6-9.4 7 3.5 3 5 1.4 1.1-1.3-.5-.3.8-.7-.6-.5.8-.6-.2-.3zM3.4 7.6l.8 4-.5.4.8.6-.6.5.8.7-.5.3 1.1 1.3 5-1.4 3.5-3-9.4-7-1 3.6z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M26.4 16l-5-1.4 1.5 2.3-2.4 4.4 3.2-.1h4.6L26.4 16zM10.6 14.6l-5 1.4-1.9 5.2h4.6l3.2.1-2.4-4.4 1.5-2.3zM17.5 16.6l.3-5.4 1.5-4h-6.6l1.4 4 .4 5.4.1 1.9.1 4.2h2.6l.1-4.2.1-1.9z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan with mobile wallet',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#3B99FC"/>
        <path d="M9.6 12.3c3.5-3.5 9.2-3.5 12.8 0l.4.4c.2.2.2.5 0 .7l-1.4 1.4c-.1.1-.3.1-.4 0l-.6-.6c-2.5-2.5-6.5-2.5-9 0l-.6.6c-.1.1-.3.1-.4 0l-1.4-1.4c-.2-.2-.2-.5 0-.7l.6-.4zm15.8 2.9l1.2 1.2c.2.2.2.5 0 .7l-5.5 5.5c-.2.2-.5.2-.7 0l-3.9-3.9c-.1-.1-.2-.1-.2 0l-3.9 3.9c-.2.2-.5.2-.7 0l-5.5-5.5c-.2-.2-.2-.5 0-.7l1.2-1.2c.2-.2.5-.2.7 0l3.9 3.9c.1.1.2.1.2 0l3.9-3.9c.2-.2.5-.2.7 0l3.9 3.9c.1.1.2.1.2 0l3.9-3.9c.2-.2.5-.2.7 0z" fill="white"/>
      </svg>
    ),
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function ConnectModal({ open, onClose }: Props) {
  const { connect, isPending } = useConnect()
  const { isConnected } = useAccount()

  const WC_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string

  useEffect(() => {
    document.body.classList.toggle('modal-open', open)
    return () => document.body.classList.remove('modal-open')
  }, [open])

  useEffect(() => {
    if (isConnected) onClose()
  }, [isConnected])

  const handleMetaMask = () => {
    connect({ connector: injected() })
  }

  const handleWalletConnect = () => {
    connect({ connector: walletConnect({ projectId: WC_PROJECT_ID }) })
  }

  const handlers: Record<string, () => void> = {
    metamask: handleMetaMask,
    walletconnect: handleWalletConnect,
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <p className="label" style={{ letterSpacing: 5, color: 'var(--text-primary)' }}>Connect Wallet</p>
                  <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {WALLETS.map(w => (
                    <motion.button
                      key={w.id}
                      onClick={handlers[w.id]}
                      disabled={isPending}
                      whileHover={{ borderColor: 'var(--gold)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        background: 'transparent', border: '1px solid var(--border)',
                        padding: '14px 16px', cursor: isPending ? 'not-allowed' : 'pointer',
                        opacity: isPending ? 0.5 : 1, textAlign: 'left', width: '100%',
                        transition: 'border-color 150ms',
                      }}
                    >
                      {w.icon}
                      <div>
                        <div style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: 1 }}>
                          {w.name}
                        </div>
                        <div className="label" style={{ fontSize: 10, letterSpacing: 2, marginTop: 2 }}>
                          {w.description}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {isPending && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="label" style={{ textAlign: 'center', marginTop: 16, letterSpacing: 3 }}>
                    Confirm in wallet…
                  </motion.p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
