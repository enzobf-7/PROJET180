'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toggleHabitAction } from './actions'
import { getXpDelta } from './utils'
import { C } from '@/lib/design-tokens'
import type { DashboardProps, XPParticle, Win } from '@/lib/types'
import { useIsMobile } from '@/lib/hooks'
import { getCurrentLevel, getLevelProgress, getNextLevel, getLevelByXp } from '@/lib/levels'
import {
  DashboardAnimations,
  XPParticles,
  LevelUpOverlay,
  TopBar,
  HeroCard,
  DailyCard,
  ProgressionPanel,
  WinsCard,
  LeaderboardCard,
} from './components'

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardClient({
  jourX, firstName, gamification, habits, completedHabitIds, responses,
  leaderboard, onboardingDate, whatsappLink, weeklyXP,
  initialTodos, initialWins, weekNumber,
}: DashboardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [completed, setCompleted] = useState<Set<string>>(new Set(completedHabitIds))
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [localXP, setLocalXP] = useState(gamification.xp_total)
  const [localStreak, setLocalStreak] = useState(gamification.current_streak)
  const [levelUpOverlay, setLevelUpOverlay] = useState<string | null>(null)
  const [particles, setParticles] = useState<XPParticle[]>([])
  const particleId = useRef(0)
  const [celebrateRing, setCelebrateRing] = useState(false)
  const [displayedLevelPct, setDisplayedLevelPct] = useState(0)
  const isMobile = useIsMobile()
  const supabase = createClient()

  // ── Wins (only shown on Sundays) ────────────────────────────────────────────
  const [wins, setWins] = useState<Win[]>(initialWins)
  const [winInput, setWinInput] = useState('')
  const [winSubmitting, setWinSubmitting] = useState(false)
  const isSunday = new Date().getDay() === 0

  const handleAddWin = async () => {
    const text = winInput.trim()
    if (!text || winSubmitting) return
    setWinSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setWinSubmitting(false); return }
    const { data, error } = await supabase
      .from('wins')
      .insert({ client_id: user.id, content: text, week_number: weekNumber })
      .select('id, content, created_at')
      .single()
    if (!error && data) {
      setWins(prev => [...prev, data])
      setWinInput('')
    }
    setWinSubmitting(false)
  }

  // ── To-do du jour ───────────────────────────────────────────────────────────
  const todayDate = new Date().toISOString().slice(0, 10)
  const [todos, setTodos] = useState(initialTodos)

  const handleToggleTodo = async (todoId: string, currentDate: string | null) => {
    const newDate = currentDate === todayDate ? null : todayDate
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, completed_date: newDate } : t))
    await supabase.from('todos').update({ completed_date: newDate }).eq('id', todoId)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleToggle = (habitId: string) => {
    if (loadingId) return
    const wasCompleted = completed.has(habitId)
    const optimisticDelta = wasCompleted ? -10 : getXpDelta(localStreak)
    setCompleted(prev => {
      const next = new Set(prev)
      wasCompleted ? next.delete(habitId) : next.add(habitId)
      return next
    })
    setLocalXP(prev => Math.max(0, prev + optimisticDelta))
    const pid = ++particleId.current
    setParticles(p => [...p, { id: pid, delta: optimisticDelta, multiplier: 1 }])
    setTimeout(() => setParticles(p => p.filter(x => x.id !== pid)), 1500)
    setLoadingId(habitId)
    startTransition(async () => {
      try {
        const result = await toggleHabitAction(habitId, !wasCompleted, habits.length)
        if (result) {
          setLocalXP(result.newXP)
          setLocalStreak(result.newStreak)
          const accuratePid = ++particleId.current
          setParticles(p => [
            ...p.filter(x => x.id !== pid),
            { id: accuratePid, delta: result.xpDelta, multiplier: result.multiplier },
          ])
          setTimeout(() => setParticles(p => p.filter(x => x.id !== accuratePid)), 1500)
          if (result.leveledUp) {
            setLevelUpOverlay(result.newLevel)
            setTimeout(() => setLevelUpOverlay(null), 2800)
          }
        }
      } catch {
        setCompleted(prev => {
          const next = new Set(prev)
          wasCompleted ? next.add(habitId) : next.delete(habitId)
          return next
        })
        setLocalXP(prev => Math.max(0, prev - optimisticDelta))
      } finally {
        setLoadingId(null)
      }
    })
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const daysPct     = Math.round((jourX / 180) * 100)
  const daysLeft    = 180 - jourX
  const xp          = localXP
  const level       = getCurrentLevel(xp)
  const levelNum    = getLevelByXp(xp)
  const levelPct    = getLevelProgress(xp)
  const nextLevel   = getNextLevel(xp)
  const streak      = localStreak
  const record      = gamification.longest_streak
  const hotStreak   = streak >= 7
  const legendStreak = streak >= 30
  const myRank      = leaderboard.find(e => e.isMe)?.rank ?? null
  const maxXP       = leaderboard[0]?.xp || 1
  const visionText  = (responses?.vision as string) ?? null
  const objectifText = (responses?.objectif_principal as string) ?? null

  // ── Badges (with progress tracking) ─────────────────────────────────────
  const BADGES: { key: string; label: string; icon: string; earned: boolean; desc: string; target: number; current: number; unit: string }[] = [
    { key: 'first_step',   label: 'Premier pas',      icon: '⚡', earned: xp >= 10,      desc: 'Premier XP gagné',      target: 10,    current: Math.min(xp, 10),     unit: 'XP' },
    { key: 'week_fire',    label: 'Semaine de feu',    icon: '🔥', earned: streak >= 7,    desc: '7 jours de série',      target: 7,     current: Math.min(streak, 7),   unit: 'j' },
    { key: 'fortnight',    label: 'Quinzaine',         icon: '⚔',  earned: streak >= 14,   desc: '14 jours de série',     target: 14,    current: Math.min(streak, 14),  unit: 'j' },
    { key: 'month_king',   label: 'Mois entier',       icon: '👑', earned: record >= 30,   desc: '30 jours de série',     target: 30,    current: Math.min(record, 30),  unit: 'j' },
    { key: 'soldier',      label: 'Soldat',            icon: '🛡',  earned: xp >= 500,      desc: '500 XP cumulés',        target: 500,   current: Math.min(xp, 500),     unit: 'XP' },
    { key: 'warrior',      label: 'Guerrier',          icon: '⚔',  earned: xp >= 1500,     desc: '1 500 XP cumulés',      target: 1500,  current: Math.min(xp, 1500),    unit: 'XP' },
    { key: 'fighter',      label: 'Combattant',        icon: '💎', earned: xp >= 3000,     desc: '3 000 XP cumulés',      target: 3000,  current: Math.min(xp, 3000),    unit: 'XP' },
    { key: 'honor',        label: "Homme d'honneur",   icon: '🏆', earned: xp >= 6000,     desc: '6 000 XP cumulés',      target: 6000,  current: Math.min(xp, 6000),    unit: 'XP' },
  ]
  const earnedCount = BADGES.filter(b => b.earned).length

  const navItems = [
    { label: 'Dashboard',  href: '/dashboard',  active: true  },
    { label: 'Programme',  href: '/programme',  active: false },
    { label: 'Profil',     href: '/profil',     active: false },
  ]

  // ── Effects ───────────────────────────────────────────────────────────────
  const isFirstRun    = useRef(true)
  const prevAllDoneRef = useRef(false)
  const hasMounted    = useRef(false)
  const allDone       = habits.length > 0 && completed.size === habits.length

  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; prevAllDoneRef.current = allDone; return }
    if (allDone && !prevAllDoneRef.current) {
      setCelebrateRing(true)
      setTimeout(() => setCelebrateRing(false), 600)
    }
    prevAllDoneRef.current = allDone
  }, [allDone])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDisplayedLevelPct(levelPct))
      })
    } else {
      setDisplayedLevelPct(levelPct)
    }
  }, [levelPct])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, overflowX: 'hidden' }}>
      <DashboardAnimations />
      <XPParticles particles={particles} isMobile={isMobile} />
      {levelUpOverlay && <LevelUpOverlay levelName={levelUpOverlay} />}

      <TopBar
        jourX={jourX}
        daysLeft={daysLeft}
        daysPct={daysPct}
        firstName={firstName}
        navItems={navItems}
        onSignOut={handleSignOut}
      />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
      }}>
        <div style={{
          flex: 1,
          padding: isMobile ? '20px 16px 40px' : '28px 32px 48px',
          maxWidth: 1120,
          width: '100%',
          margin: '0 auto',
        }}>
          <HeroCard
            xp={xp}
            levelNum={levelNum}
            level={level}
            nextLevel={nextLevel}
            displayedLevelPct={displayedLevelPct}
            weeklyXP={weeklyXP}
            streak={streak}
            record={record}
            hotStreak={hotStreak}
            myRank={myRank}
            isMobile={isMobile}
          />

          {/* Two-column: DailyCard + Progression */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 20, marginBottom: 20 }}>
            <DailyCard
              habits={habits}
              completed={completed}
              loadingId={loadingId}
              firstName={firstName}
              isMobile={isMobile}
              celebrateRing={celebrateRing}
              onToggle={handleToggle}
              todos={todos}
              todayDate={todayDate}
              onToggleTodo={handleToggleTodo}
            />
            <ProgressionPanel
              streak={streak}
              hotStreak={hotStreak}
              legendStreak={legendStreak}
              badges={BADGES}
              earnedCount={earnedCount}
              objectifText={objectifText}
              visionText={visionText}
              whatsappLink={whatsappLink}
            />
          </div>

          {/* Leaderboard — full width */}
          <LeaderboardCard
            leaderboard={leaderboard}
            maxXP={maxXP}
            isMobile={isMobile}
          />

          {/* Wins — Sunday only */}
          {isSunday && (
            <div style={{ marginTop: 20 }}>
              <WinsCard
                wins={wins}
                weekNumber={weekNumber}
                winInput={winInput}
                winSubmitting={winSubmitting}
                onWinInputChange={setWinInput}
                onAddWin={handleAddWin}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
