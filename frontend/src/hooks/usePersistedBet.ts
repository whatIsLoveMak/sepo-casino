import { useState, useEffect } from 'react'

export function usePersistedBet(storageKey: string) {
  const [betAmount, setBetAmount] = useState<string>(() => {
    try { return localStorage.getItem(`${storageKey}_bet`) || '0.01' } catch { return '0.01' }
  })

  const [prediction, setPrediction] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(`${storageKey}_prediction`) || '50', 10) } catch { return 50 }
  })

  useEffect(() => {
    try { localStorage.setItem(`${storageKey}_bet`, betAmount) } catch {}
  }, [betAmount, storageKey])

  useEffect(() => {
    try { localStorage.setItem(`${storageKey}_prediction`, String(prediction)) } catch {}
  }, [prediction, storageKey])

  return { betAmount, setBetAmount, prediction, setPrediction }
}
