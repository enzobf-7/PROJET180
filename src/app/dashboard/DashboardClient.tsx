'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toggleHabitAction } from './actions'
import { getXpDelta } from './utils'
import { C } from '@/lib/design-tokens'
import type { DashboardProps, XPParticle, Win } from '@/lib/types'
import { useCountdown, useIsMobile } from '@/lib/hooks'
import { getCurrentLevel, getLevelProgress, getNextLevel, getLevelByXp } from '@/lib/levels'
import {
  DashboardAnimations,
  XPParticles,
  LevelUpOverlay,
  Sidebar,
  StickyHeader,
  HeroCard,
  CheckInCard,
  ProgressionPanel,
  TodoCard,
  WinsCard,
  LeaderboardCard,
  MobileBottomNav,
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
  const countdown = useCountdown(onboardingDate)
  const supabase  = createClient()

  // ── Wins (server-side initial data, client-side for optimistic adds) ──────
  const [wins, setWins] = useState<Win[]>(initialWins)
  const [winInput, setWinInput] = useState('')
  const [winSubmitting, setWinSubmitting] = useState(false)

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

  // ── To-do du jour (server-side initial data, client-side for optimistic toggles)
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

  // ── Badges ────────────────────────────────────────────────────────────────
  const BADGES: { key: string; label: string; icon: string; earned: boolean; desc: string }[] = [
    { key: 'first_step',   label: 'Premier pas',      icon: '⚡', earned: xp >= 10,      desc: 'Premier XP gagné' },
    { key: 'week_fire',    label: 'Semaine de feu',    icon: '🔥', earned: streak >= 7,    desc: '7 jours de série' },
    { key: 'fortnight',    label: 'Quinzaine',         icon: '⚔',  earned: streak >= 14,   desc: '14 jours de série' },
    { key: 'month_king',   label: 'Mois entier',       icon: '👑', earned: record >= 30,   desc: '30 jours de série' },
    { key: 'soldier',      label: 'Soldat',            icon: '🛡',  earned: xp >= 500,      desc: '500 XP cumulés' },
    { key: 'warrior',      label: 'Guerrier',          icon: '⚔',  earned: xp >= 1500,     desc: '1 500 XP cumulés' },
    { key: 'fighter',      label: 'Combattant',        icon: '💎', earned: xp >= 3000,     desc: '3 000 XP cumulés' },
    { key: 'honor',        label: "Homme d'honneur",   icon: '🏆', earned: xp >= 6000,     desc: '6 000 XP cumulés' },
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
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, overflowX: 'hidden' }}>
      <DashboardAnimations />
      <XPParticles particles={particles} isMobile={isMobile} />
      {levelUpOverlay && <LevelUpOverlay levelName={levelUpOverlay} />}

      {!isMobile && (
        <Sidebar
          firstName={firstName}
          level={level}
          navItems={navItems}
          whatsappLink={whatsappLink}
          jourX={jourX}
          daysPct={daysPct}
          onSignOut={handleSignOut}
        />
      )}

      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 220,
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: '100vh',
      }}>
        <StickyHeader
          jourX={jourX}
          daysLeft={daysLeft}
          daysPct={daysPct}
          isMobile={isMobile}
          countdown={countdown}
          onboardingDate={onboardingDate}
        />

        <div style={{
          flex: 1,
          padding: isMobile ? '20px 16px 100px' : '28px 32px 48px',
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

          {/* Two-column: Check-in + Progression */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 20, marginBottom: 20 }}>
            <CheckInCard
              habits={habits}
              completed={completed}
              loadingId={loadingId}
              firstName={firstName}
              isMobile={isMobile}
              celebrateRing={celebrateRing}
              onToggle={handleToggle}
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

          {/* Three-column: Todo + Wins + Leaderboard */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
            <TodoCard
              todos={todos}
              todayDate={todayDate}
              onToggleTodo={handleToggleTodo}
            />
            <WinsCard
              wins={wins}
              weekNumber={weekNumber}
              winInput={winInput}
              winSubmitting={winSubmitting}
              onWinInputChange={setWinInput}
              onAddWin={handleAddWin}
            />
            <LeaderboardCard
              leaderboard={leaderboard}
              maxXP={maxXP}
              isMobile={isMobile}
            />
          </div>
        </div>

        {isMobile && <MobileBottomNav navItems={navItems} />}
      </main>
    </div>
  )
}
