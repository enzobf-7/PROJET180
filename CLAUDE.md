# PROJET180 APP — CLAUDE.md

Plateforme de coaching 180j "Projet180" par Robin Duplouis.

## Stack
- **Next.js 16** App Router, React 19, TypeScript, Tailwind CSS 4
- **Supabase** : auth + DB (RLS activé sur toutes les tables)
- **Stripe** : webhook → création automatique de compte client
- **Brevo** : emails transactionnels (SMTP API)
- **Anthropic Claude Haiku** : génération de rapports hebdo IA
- **Vercel** : déploiement + crons planifiés

## Dev
```bash
npm run dev   # port 3000 (depuis la racine projet180-app/)
```

## Structure des routes
```
/                → login (email/password)
/onboarding      → flow 5 étapes (nouveau client)
/dashboard       → check-in habitudes/missions, XP, streaks, todos, wins, leaderboard
/profil          → stats + réponses questionnaire (6 sections)
/programme       → viewer programme 180j (3 phases, 26 semaines)
/messagerie      → messagerie client ↔ Robin
/admin           → panel Robin (4 onglets : clients, missions/habits, todos, config)
/admin/client/[id] → fiche détaillée d'un client
/admin/messagerie → messagerie admin → clients
```

## Variables d'environnement requises
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
BREVO_API_KEY=
NEXT_PUBLIC_APP_URL=https://app.projet180.fr
CRON_SECRET=<secret aléatoire — Vercel l'envoie dans Authorization: Bearer>
COACH_EMAIL=robin@projet180.fr
NEXT_PUBLIC_SEED_TEST_USER=false
ANTHROPIC_API_KEY=<clé API Anthropic — pour les weekly reports AI>
```

## DB — Tables et gotchas critiques

### Gotcha #1 — `onboarding_progress` utilise `user_id`, pas `client_id`
```sql
-- CORRECT
.eq('user_id', user.id)
-- FAUX (toutes les autres tables utilisent client_id)
.eq('client_id', user.id)
```

### Gotcha #2 — `habits.created_by` est un enum texte, pas un UUID
```sql
created_by text not null check (created_by in ('admin', 'client'))
-- Toujours insérer 'admin' depuis les routes admin, jamais user.id
```

### Gotcha #3 — `habits.category` distingue habitudes et missions
```sql
category text check (category in ('habit', 'mission'))
-- 'habit' = quotidien récurrent, 'mission' = one-shot
```

### Tables
| Table | FK principale | Notes |
|-------|-------------|-------|
| `profiles` | `id` = auth.users.id | `role` ('admin'/'client'), `email`, `first_name`, `last_name` |
| `app_settings` | — | 4 champs config (WhatsApp, Skool, iClosed, contrat PDF) |
| `onboarding_progress` | `user_id` | Étapes 1-5, `step1_signature_name`, `step1_signed_at`, `completed_at` |
| `questionnaire_responses` | `client_id` | 40+ champs réponses formulaire (7 sections) |
| `programs` | `client_id` | Données programme 180j |
| `habits` | `client_id` | `is_active`, `sort_order`, `category` ('habit'\|'mission'), `created_by` ('admin'\|'client') |
| `habit_logs` | `client_id` | Check-ins quotidiens, `date` (YYYY-MM-DD), `completed` |
| `weekly_reports` | `client_id` | Rapports hebdo auto IA, `week_number` (1-26) |
| `gamification` | `client_id` | `xp_total`, `current_streak`, `longest_streak`, `level` |
| `messages` | `sender_id`, `receiver_id` | Messagerie Robin ↔ clients |
| `milestone_emails_sent` | `client_id` | Déduplique les emails J30/J60/J90/J180 via `(client_id, milestone_day)` unique |
| `todos` | `client_id` | `title`, `is_system` (bool — 4 todos fixes), `completed_date` (date). RLS: clients voient les leurs, admin voit tout |
| `wins` | `client_id` | `content` text, `week_number` int. Index sur `(client_id, week_number)` |

## API Routes
| Route | Méthode | Rôle |
|-------|---------|------|
| `/api/webhooks/stripe` | POST | Webhook `checkout.session.completed` → crée user + profiles + onboarding + programs + gamification + 4 system todos + email Brevo |
| `/api/onboarding/contract-signed` | POST | Enregistre signature contrat (step1_signature_name, step1_signed_at) |
| `/api/admin/clients` | GET/POST | Liste clients avec XP/level/onboarding / Créer client manuellement |
| `/api/admin/habits` | GET/POST | Liste habits (filtre clientId) / Créer habit (calcul auto sort_order, created_by='admin') |
| `/api/admin/todos` | GET/POST/DELETE | Liste/Créer/Supprimer todos (sécurité: impossible de supprimer is_system=true) |
| `/api/dev/create-test-user` | POST | Crée user test (demo+p180-client@example.com / DemoClient123!) — désactivé si SEED=false |
| `/api/dev/complete-onboarding` | POST | Skip onboarding pour tests |
| `/api/dev/seed-demo-data` | POST | Données de démo pour tests |

## Clients Supabase
```typescript
import { createClient } from '@/lib/supabase/server'      // routes authentifiées (cookies)
import { createBrowserClient } from '@/lib/supabase/client' // composants client (browser)
import { createAdminClient } from '@/lib/supabase/admin'    // routes admin (bypass RLS)
// Middleware auth refresh :
import { updateSession } from '@/lib/supabase/middleware'
```

## Composants

### UI de base (src/components/)
| Composant | Props clés | Notes |
|-----------|-----------|-------|
| `P180Button` | `variant` (primary/ghost/danger), `size` (sm/md/lg), `loading`, `fullWidth` | uppercase tracking-wider, Barlow Condensed |
| `P180Input` | `label`, `error` | Focus accent blue |
| `P180Logo` | `size` | Affiche logo-projet180.svg |

### Dashboard (src/app/dashboard/components/)
| Composant | Rôle |
|-----------|------|
| `HeroCard` | Header avec prénom, barre jourX/180, niveau actuel/suivant |
| `CheckInCard` | Check-in habits + missions séparés, % completion, animation checkmark |
| `TodoCard` | 4 system todos (badge "SYSTÈME") + custom todos, toggle completed_date |
| `WinsCard` | Wins de la semaine, input pour ajouter, icône check verte |
| `ProgressionPanel` | Compteur XP animé, streak actuel/max, nom du niveau |
| `LeaderboardCard` | Top 100 clients par XP, highlight user actuel |
| `LevelUpOverlay` | Overlay plein écran quand level up |
| `XPParticles` | Particules "+10 XP" animées qui montent, multiplicateurs (×1, ×1.5, ×2, ×3) |
| `AnimatedCounter` | Transitions numériques animées (XP, streaks) |
| `DashboardAnimations` | CSS animations (fade-in, slide-in, habit-check bounce) |
| `StickyHeader` | Header sticky avec jourX, progression check-in du jour |
| `Sidebar` | Nav desktop (Dashboard, Profil, Programme, Messagerie, Admin si admin) |
| `MobileBottomNav` | Navigation mobile bottom bar |

## Lib (src/lib/)
| Fichier | Rôle |
|---------|------|
| `levels.ts` | 6 niveaux de gamification. Fonctions: `getCurrentLevel()`, `getLevelProgress()`, `getNextLevel()`, `getLevelByXp()`, `getLevelName()` |
| `design-tokens.ts` | Couleurs (C.bg, C.surface, C.accent...) et fonts (D=Barlow, M=JetBrains) — source unique |
| `types/dashboard.ts` | Interfaces: Habit, Gamification, LeaderboardEntry, DashboardProps, XPParticle, Todo, Win |
| `hooks/useCountdown.ts` | Hook countdown timer |
| `hooks/useIsMobile.ts` | Hook media query responsive |

## Dashboard — Logique XP & Streaks
```
src/app/dashboard/actions.ts   → Server action toggleHabitAction()
src/app/dashboard/utils.ts     → getXpDelta(streak) : base 10 XP, ×1.5 à 7j, ×2 à 14j, ×3 à 30j
```
- **Perfect day bonus** : tous les habits complétés le même jour → multiplicateur ×1.5
- **Streak** : incrémenté au check-in quotidien, reset si jour sauté
- **Optimistic UI** : mise à jour locale immédiate, sync serveur en background

## Design system
- **Prefix CSS**: `p180-*` (ex: `p180-accent`, `p180-bg`, `p180-border`)
- **Accent**: `#3A86FF` (bleu) / hover: `#2D6FE6`
- **Fond OLED**: `#0B0B0B` (bg) / Surface: `#0F0F0F` / Sidebar: `#0A0A0A` / Border: `#1E1E1E`
- **Muted**: `#484848`
- **Vert**: `#15803D` (wins/todos), plus clair `#22C55E`
- **Fonts**: Barlow Condensed (display, labels, boutons), JetBrains Mono (XP, nombres, données)
- **Composants**: P180Button, P180Input, P180Logo (tout Tailwind custom, pas de lib externe)
- **Typo globale**: `uppercase tracking-wider font-medium` + `fontFamily: "'Barlow Condensed', sans-serif"`
- UI en français

## Niveaux de gamification
| Niveau | XP min | Nom |
|--------|--------|-----|
| 1 | 0 | L'Endormi |
| 2 | 500 | L'Éveillé |
| 3 | 1 500 | Le Bâtisseur |
| 4 | 3 000 | Le Souverain |
| 5 | 6 000 | Le Point de Bascule |
| 6 | 12 000 | Le 180 |

Source unique : `src/lib/levels.ts`

## Onboarding — 5 étapes
1. **Signature contrat** — Affiche PDF iClosed, champ signature, enregistre `step1_signature_name` + `step1_signed_at`
2. **Questionnaire** — 7 sections (Identité, Corps/Santé, Business/Finances, Psychologie, Social, Vision, Pour finir), 40+ champs
3. **WhatsApp** — Lien pour rejoindre le groupe
4. **Skool** — Lien pour rejoindre la communauté
5. **Appel** — Planification du premier appel coaching

## Crons Vercel (`vercel.json`)
| Route | Schedule | Rôle | maxDuration |
|-------|----------|------|-------------|
| `/api/cron/weekly-reports` | Lundi 8h UTC | Génère rapports IA (Claude Haiku) semaine 1-26 | 60s |
| `/api/cron/habit-reminders` | Tous les jours 9h UTC | Email si aucun habit coché la veille | — |
| `/api/cron/milestone-emails` | Tous les jours 8h UTC | Emails J30/J60/J90/J180 (dédupliqués) | — |

Tous les crons vérifient `Authorization: Bearer <CRON_SECRET>`.

## Flux Stripe
1. Client paie → Stripe envoie webhook `checkout.session.completed`
2. `/api/webhooks/stripe` (maxDuration: 30s) → crée user Supabase Auth + insère dans `profiles`, `onboarding_progress`, `programs`, `gamification` + 4 system todos
3. Email de bienvenue Brevo envoyé automatiquement

## Programme 180j
- **3 phases** : Fondations, Accélération, Consolidation
- **26 semaines** de contenu
- Types de modules : video, lecture, exercise, call, podcast, challenge, bonus
- Chaque module : title, description, optional duration, optional URL

## Rôles
- `admin` : accès `/admin`, `/admin/client/[id]`, `/admin/messagerie`, middleware redirige automatiquement
- `client` : accès `/dashboard`, `/profil`, `/programme`, `/messagerie`, `/onboarding`
- Défini dans `profiles.role`, vérifié dans `src/middleware.ts`

## Migrations DB requises avant déploiement
Exécuter dans Supabase SQL Editor (dans cet ordre) :
```
supabase/migrations/20260309_milestone_emails_sent.sql
supabase/migrations/20260310_contract_signature.sql
supabase/migrations/20260311_habits_category.sql
supabase/migrations/20260311_todos.sql
supabase/migrations/20260311_wins.sql
supabase/migrations/20260311_system_todos.sql
```

## Go-live checklist
- [ ] Toutes les migrations exécutées dans Supabase
- [ ] Variables d'env configurées dans Vercel (voir liste ci-dessus)
- [ ] Stripe webhook URL configurée : `https://app.projet180.fr/api/webhooks/stripe`
- [ ] Robin a entré ses 4 liens dans `/admin` (WhatsApp, Skool, iClosed, contrat PDF)
- [ ] Compte admin Robin créé (role = 'admin' dans `profiles`)
- [ ] Domaine configuré → CNAME vers `cname.vercel-dns.com`
- [ ] Test E2E : paiement Stripe → email → login → onboarding → dashboard
