'use client'

import { useState, useEffect, useRef } from 'react'

export function AnimatedCounter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const prevRef = useRef(0)
  useEffect(() => {
    const from = prevRef.current
    prevRef.current = to
    const d = (from === 0 && to > 50) ? duration : 280
    let start: number | null = null
    let raf: number
    const tick = (ts: number) => {
      if (!start) start = ts
      const p    = Math.min((ts - start) / d, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setCount(Math.round(from + ease * (to - from)))
      if (p < 1) { raf = requestAnimationFrame(tick) }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{count.toLocaleString('fr-FR')}</>
}
