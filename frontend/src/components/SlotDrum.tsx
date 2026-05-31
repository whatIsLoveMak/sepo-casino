import { useRef, useImperativeHandle, forwardRef } from 'react'

export type SlotDrumHandle = {
  spin: (finalDigit: number, win: boolean, delay: number) => Promise<void>
  reset: () => void
}

const SlotDrum = forwardRef<SlotDrumHandle>((_, ref) => {
  const reelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getSize = () => {
    const h = containerRef.current?.offsetHeight ?? 160
    const fs = Math.round(h * 0.625)
    return { h, fs }
  }

  const makeItem = (d: string | number, color: string, opacity: string, h: number, fs: number) => {
    const div = document.createElement('div')
    div.style.cssText = `height:${h}px;display:flex;align-items:center;justify-content:center;padding-top:23px;font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:${fs}px;line-height:1;font-variant-numeric:tabular-nums;width:100%;flex-shrink:0;opacity:${opacity};color:${color};`
    div.textContent = String(d)
    return div
  }

  useImperativeHandle(ref, () => ({
    spin(finalDigit: number, win: boolean, delay: number) {
      return new Promise(resolve => {
        const reel = reelRef.current
        if (!reel) { resolve(); return }
        const { h, fs } = getSize()

        const items: number[] = []
        for (let i = 0; i < 22; i++) items.push(Math.floor(Math.random() * 10))
        items.push(finalDigit)

        reel.innerHTML = ''
        reel.style.transition = 'none'
        reel.style.transform = 'translateY(0)'

        items.forEach((d, i) => {
          const isFinal = i === items.length - 1
          reel.appendChild(makeItem(d, isFinal ? (win ? '#d4a830' : '#cc3333') : '#d4a830', isFinal ? '1' : '0.35', h, fs))
        })

        const endY = -(items.length - 1) * h

        setTimeout(() => {
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const dur = 1700
            reel.style.transition = `transform ${dur}ms cubic-bezier(0.12,0.9,0.28,1.0)`
            reel.style.transform = `translateY(${endY}px)`

            setTimeout(() => {
              reel.innerHTML = ''
              reel.style.transition = 'none'
              reel.style.transform = 'translateY(0)'
              reel.appendChild(makeItem(finalDigit, win ? '#d4a830' : '#cc3333', '1', h, fs))
              resolve()
            }, dur + 30)
          }))
        }, delay)
      })
    },

    reset() {
      const reel = reelRef.current
      if (!reel) return
      const { h, fs } = getSize()
      reel.innerHTML = ''
      reel.style.transition = 'none'
      reel.style.transform = 'translateY(0)'
      reel.appendChild(makeItem('—', '#2e2a38', '1', h, fs))
    },
  }))

  return (
    <div ref={containerRef} className="slot-drum" style={{
      width: 120,
      height: 160,
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
      background: 'transparent',
    }}>
      {/* Gold lines top/bottom */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: '#d4a830', opacity: 0.4, zIndex: 4 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: '#d4a830', opacity: 0.4, zIndex: 4 }} />
      {/* Fade top */}
      <div className="slot-drum-fade-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 55, background: 'linear-gradient(to bottom, var(--bg-base), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      {/* Fade bottom */}
      <div className="slot-drum-fade-bottom" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 55, background: 'linear-gradient(to top, var(--bg-base), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div ref={reelRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute', top: 0, left: 0, width: '100%' }} />
    </div>
  )
})

SlotDrum.displayName = 'SlotDrum'
export default SlotDrum
