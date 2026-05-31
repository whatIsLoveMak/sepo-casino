import { useState, useEffect } from 'react'
import { useAccount, useReconnect } from 'wagmi'
import { usePersistedBet } from './hooks/usePersistedBet'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ConnectModal from './components/ConnectModal'
import { AnimatePresence, motion } from 'framer-motion'
import ParticleBackground from './components/ParticleBackground'
import BalanceHeader from './components/BalancePanel'
import DiceGame from './components/DiceGame'
import DemoGame from './components/DemoGame'
import History from './components/History'

function GoldConnectButton({ onPlay }: { onPlay?: () => void }) {
  const [showConnect, setShowConnect] = useState(false)

  return (
    <>
      <ConnectButton.Custom>
        {({ openChainModal, account, chain, mounted }) => {
          if (!mounted) return null
          if (!account) return (
            <motion.button
              onClick={() => setShowConnect(true)}
              className="btn-gold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                color: '#000', border: 'none', padding: '14px 48px',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: 5,
                textTransform: 'uppercase' as const, cursor: 'pointer',
                width: '100%',
              }}
            >
              Connect Wallet
            </motion.button>
          )
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {chain?.unsupported && (
                <button onClick={openChainModal} style={{ color: 'var(--gold)', background: 'transparent', border: '1px solid var(--gold)', padding: '8px 16px', cursor: 'pointer', fontSize: 11, letterSpacing: 2, fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Wrong network
                </button>
              )}
              <motion.button
                onClick={onPlay}
                className="btn-gold"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  color: '#000', border: 'none', padding: '14px 48px',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: 5,
                  textTransform: 'uppercase' as const, cursor: 'pointer',
                  width: '100%',
                }}
              >
                Play Real
              </motion.button>
            </div>
          )
        }}
      </ConnectButton.Custom>
      <ConnectModal open={showConnect} onClose={() => setShowConnect(false)} />
    </>
  )
}

function Landing({ onDemo, onPlay }: { onDemo: () => void; onPlay: () => void }) {
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

      <header className="relative z-10 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)', padding: 12 }}>
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--gold)', fontSize: 20 }}>♠</span>
          <span className="font-serif" style={{ fontSize: 13, letterSpacing: 5, color: 'var(--text-primary)' }}>
            SEPO CASINO
          </span>
        </div>
        <span className="label">Sepolia Testnet</span>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <p className="label" style={{ color: 'var(--gold)', letterSpacing: 6, marginBottom: 24 }}>
          On-chain · Verifiable · Non-custodial
        </p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 16 }}>
          Roll the dice.<br />
          <em style={{ color: 'var(--gold)' }}>Own the odds.</em>
        </h1>
        <p className="label" style={{ marginBottom: 48 }}>Ethereum Sepolia Testnet</p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <GoldConnectButton onPlay={onPlay} />
          <motion.button
            onClick={onDemo}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '14px 48px',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 5,
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Play Demo
          </motion.button>
        </div>

        <div className="flex gap-16 pb-16" style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 16 }}>
          {[['2%', 'House Edge'], ['49×', 'Max Payout'], ['0.001', 'Min Bet ETH']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="font-num" style={{ fontSize: 28, color: 'var(--gold)' }}>{val}</div>
              <div className="label" style={{ marginTop: 6 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Game({ onDemo, onHome, betAmount, setBetAmount, prediction, setPrediction, historyTrigger, onRoll }: {
  onDemo: () => void; onHome: () => void
  betAmount: string; setBetAmount: (v: string) => void
  prediction: number; setPrediction: (v: number) => void
  historyTrigger: number; onRoll: () => void
}) {
  return (
    <motion.div
      key="game"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', position: 'relative' }}
    >
      <ParticleBackground />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <BalanceHeader onDemo={onDemo} onHome={onHome} />
        <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 8px', width: '100%' }}>
          <DiceGame betAmount={betAmount} setBetAmount={setBetAmount} prediction={prediction} setPrediction={setPrediction} onRoll={onRoll} />
          <History refreshTrigger={historyTrigger} />
        </main>
      </div>
    </motion.div>
  )
}

function DemoMode({ onExit, onHome, balance, setBalance, betAmount, setBetAmount, prediction, setPrediction }: {
  onExit: () => void; onHome: () => void
  balance: number; setBalance: (b: number) => void
  betAmount: string; setBetAmount: (v: string) => void
  prediction: number; setPrediction: (v: number) => void
}) {
  const [showConnect, setShowConnect] = useState(false)
  const { isConnected } = useAccount()

  return (
    <motion.div
      key="demo"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', position: 'relative' }}
    >
      <ParticleBackground />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Demo header */}
      <header className="sticky top-0 z-10 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', padding: 12 }}>
        <button
          onClick={onHome}
          className="flex items-center gap-3"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>♠</span>
          <span className="font-serif" style={{ fontSize: 13, letterSpacing: 4, color: 'var(--text-primary)' }}>
            SEPO CASINO
          </span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="font-num" style={{ fontSize: 18, color: 'var(--gold)' }}>{balance.toFixed(2)}</span>
            <span className="label">ETH</span>
          </div>
          <button
            onClick={isConnected ? onExit : () => setShowConnect(true)}
            className="btn-gold"
            style={{
              color: '#000', border: 'none', padding: '6px 16px',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: 3,
              textTransform: 'uppercase' as const, cursor: 'pointer',
            }}
          >
            {isConnected ? 'Play Real' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 8px', width: '100%' }}>
        <DemoGame balance={balance} setBalance={setBalance} betAmount={betAmount} setBetAmount={setBetAmount} prediction={prediction} setPrediction={setPrediction}  />
      </main>
      </div>
      <ConnectModal open={showConnect} onClose={() => setShowConnect(false)} />
    </motion.div>
  )
}

export default function App() {
  const { isConnected } = useAccount()
  const { reconnect } = useReconnect()
  const [isDemo, setIsDemo] = useState(false)
  const [showLanding, setShowLanding] = useState(false)
  const [demoBalance, setDemoBalance] = useState(1000)
  const [historyTrigger, setHistoryTrigger] = useState(0)
  const realBet = usePersistedBet('real')
  const demoBet = usePersistedBet('demo')

  useEffect(() => { reconnect() }, [])

  useEffect(() => {
    if (isConnected && isDemo) setIsDemo(false)
    if (isConnected) setShowLanding(false)
  }, [isConnected])

  return (
    <AnimatePresence mode="wait">
      {isDemo ? (
        <DemoMode key="demo" onExit={() => { setIsDemo(false); setShowLanding(false) }} onHome={() => { setIsDemo(false); setShowLanding(true) }} balance={demoBalance} setBalance={setDemoBalance} betAmount={demoBet.betAmount} setBetAmount={demoBet.setBetAmount} prediction={demoBet.prediction} setPrediction={demoBet.setPrediction} />
      ) : isConnected && !showLanding ? (
        <Game key="game" onDemo={() => setIsDemo(true)} onHome={() => setShowLanding(true)} betAmount={realBet.betAmount} setBetAmount={realBet.setBetAmount} prediction={realBet.prediction} setPrediction={realBet.setPrediction} historyTrigger={historyTrigger} onRoll={() => setHistoryTrigger(t => t + 1)} />
      ) : (
        <Landing key="landing" onDemo={() => setIsDemo(true)} onPlay={() => setShowLanding(false)} />
      )}
    </AnimatePresence>
  )
}
