# PROJET180 APP — CLAUDE.md

Plateforme de coaching 180j "Projet180" par Robin Duplouis.

## Stack
- **Next.js 16** App Router, React 19, TypeScript, Tailwind CSS 4
- **Supabase** : auth + DB (RLS activé sur toutes les tables)
- **Stripe** : webhook → création automatique de compte client
- **Brevo** : emails transactionnels (SMTP API)
- **Vercel** : déploiement + crons planifiés

## Dev
```bash
npm run dev   # port 3000 (depuis la racine glc-app/)
```

## Structure des routes
```
/                → login
/onboarding      → flow 5 étapes (nouveau client)
/dashboard       → check-in habitudes, XP, streaks, leaderboard
/profil          → stats + réponses questionnaire
/programme       → viewer programme 180j
/admin           → panel Robin (config + gestion clients/habits)
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

### Tables
| Table | FK principale | Notes |
|-------|-------------|-------|
| `profiles` | `id` = auth.users.id | Contient `role` ('admin'/'client'), `email`, `first_name`, `last_name` |
| `app_settings` | — | 4 champs config (WhatsApp, Skool, iClosed, contrat PDF) |
| `onboarding_progress` | `user_id` | Étapes 1-5, `completed_at` quand tout est fait |
| `questionnaire_responses` | `client_id` | 40+ champs réponses formulaire |
| `programs` | `client_id` | Données programme 180j |
| `habits` | `client_id` | Habitudes par client, `is_active`, `sort_order`, `category` ('habit'\|'mission') |
| `habit_logs` | `client_id` | Check-ins quotidiens, `date` (YYYY-MM-DD), `completed` |
| `weekly_reports` | `client_id` | Rapports hebdo auto, `week_number` (1-26) |
| `gamification` | `client_id` | `xp_total`, `current_streak`, `level` |
| `messages` | `sender_id`, `receiver_id` | Messagerie Robin ↔ clients |
| `milestone_emails_sent` | `client_id` | Déduplique les emails J30/J60/J90/J180 |
| `todos` | `client_id` | To-do journalière, `is_system` (bool), `completed_date` (date) |
| `wins` | `client_id` | Wins hebdo, `content` text, `week_number` int |

## Clients Supabase
```typescript
import { createClient } from '@/lib/supabase/server'   // pour les routes authentifiées
import { createAdminClient } from '@/lib/supabase/admin' // pour les routes admin (bypass RLS)
```

## Design system
- **Prefix CSS**: `p180-*` (ex: `p180-accent`, `p180-bg`, `p180-border`)
- **Accent**: `#3A86FF` (bleu) / hover: `#2D6FE6`
- **Fond OLED**: `#060606` / Surface: `#0F0F0F` / Border: `#1E1E1E`
- **Muted**: `#484848`
- **Fonts**: Barlow Condensed (display), JetBrains Mono (mono)
- **Composants**: P180Button, P180Input, P180Logo (tout Tailwind custom, pas de lib)
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

## Crons Vercel (`vercel.json`)
| Route | Schedule | Rôle |
|-------|----------|------|
| `/api/cron/weekly-reports` | Lundi 8h UTC | Génère rapports semaine |
| `/api/cron/habit-reminders` | Tous les jours 9h UTC | Email si aucun habit coché la veille |
| `/api/cron/milestone-emails` | Tous les jours 8h UTC | Emails J30/J60/J90/J180 |

Tous les crons vérifient `Authorization: Bearer <CRON_SECRET>`.

## Flux Stripe
1. Client paie → Stripe envoie webhook `checkout.session.completed`
2. `/api/webhooks/stripe` → crée user Supabase Auth + insère dans `profiles`, `onboarding_progress`, `programs`, `gamification`
3. Email de bienvenue Brevo envoyé automatiquement

## Rôles
- `admin` : accès `/admin`, middleware redirige automatiquement
- `client` : accès `/dashboard`, `/profil`, `/programme`, `/onboarding`
- Défini dans `profiles.role`, vérifié dans `src/middleware.ts`

## Migrations DB requises avant déploiement
Exécuter dans Supabase SQL Editor (dans cet ordre) :
```
supabase/migrations/20260309_milestone_emails_sent.sql
supabase/migrations/20260310_contract_signature.sql
supabase/migrations/20260311_habits_category.sql
supabase/migrations/20260311_todos.sql
supabase/migrations/20260311_wins.sql
```

## Go-live checklist
- [ ] Toutes les migrations exécutées dans Supabase
- [ ] Variables d'env configurées dans Vercel (voir liste ci-dessus)
- [ ] Stripe webhook URL configurée : `https://app.projet180.fr/api/webhooks/stripe`
- [ ] Robin a entré ses 4 liens dans `/admin` (WhatsApp, Skool, iClosed, contrat PDF)
- [ ] Compte admin Robin créé (role = 'admin' dans `profiles`)
- [ ] Domaine configuré → CNAME vers `cname.vercel-dns.com`
- [ ] Test E2E : paiement Stripe → email → login → onboarding → dashboard
