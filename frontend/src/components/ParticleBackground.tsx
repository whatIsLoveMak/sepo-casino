import { useEffect, useRef } from 'react'

declare global {
  interface Window { __rolling: boolean }
}

type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number }

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    let particles: Particle[] = []
    let rafId: number
    let intensity = 0.5 // 0.5 = idle, 1.0 = rolling

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    const mkParticle = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.4 + 0.05,
    })

    resize()
    particles = Array.from({ length: 120 }, mkParticle)

    const draw = () => {
      // Lerp intensity toward target
      const target = window.__rolling ? 1.0 : 0.5
      intensity += (target - intensity) * 0.04

      const lineAlphaBase = 0.08 * intensity * 2
      const dotAlphaBase = intensity * 2
      const speed = 1 + intensity * 0.8

      ctx.clearRect(0, 0, W, H)

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(212,168,48,${lineAlphaBase * (1 - dist / 130)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,168,48,${p.alpha * dotAlphaBase})`
        ctx.fill()
        p.x += p.vx * speed
        p.y += p.vy * speed
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
      })

      rafId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
