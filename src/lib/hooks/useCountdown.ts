'use client'

import { useState, useEffect } from 'react'

export interface CountdownTime {
  d: number
  h: number
  m: number
  s: number
}

export function useCountdown(startDate: string | null): CountdownTime {
  const [t, setT] = useState<CountdownTime>({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      if (!startDate) return
      const diff = Math.max(0, new Date(startDate).getTime() + 180 * 86400000 - Date.now())
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startDate])
  return t
}

export const p2 = (n: number) => String(n).padStart(2, '0')
