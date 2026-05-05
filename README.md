# Prode Mundial 2026

Monorepo completo para el sistema de prodes del Mundial.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router + Turbopack) |
| Backend | NestJS 11 (Fastify) |
| Base de datos | Supabase (PostgreSQL + RLS + Edge Functions) |
| Auth | Supabase Auth (Google OAuth) |
| Pagos | MercadoPago Checkout Pro |
| Notificaciones | Meta WhatsApp Business API v22 |
| Instagram | Meta Graph API v22 |
| Fútbol | football-data.org v4 |
| Monorepo | Turborepo + npm workspaces |
| Deploy | Vercel (web) + Railway/Fly.io (api) + Supabase |

## Estructura

```
prode-mundial/
├── apps/
│   ├── web/                    # Next.js 15 — frontend
│   │   └── src/
│   │       ├── app/            # App Router
│   │       │   ├── (marketing)/          # Landing pública
│   │       │   ├── (auth)/login|register # Auth
│   │       │   ├── (empresa)/empresa/    # Panel empresa
│   │       │   ├── p/[slug]/             # Prode público del participante
│   │       │   └── api/
│   │       │       └── webhooks/
│   │       │           ├── mercadopago/  # Pagos
│   │       │           └── instagram/    # IG events
│   │       ├── components/
│   │       │   ├── ui/         # Primitivos (Button, Input, Modal…)
│   │       │   ├── layout/     # Header, Sidebar, BottomNav
│   │       │   ├── marketing/  # Secciones del landing
│   │       │   ├── empresa/    # Panel de empresa
│   │       │   ├── prode/      # Vista participante
│   │       │   ├── promos/     # Carrusel geolocalizadas
│   │       │   └── instagram/  # Modal preview IG
│   │       ├── lib/
│   │       │   ├── supabase/   # client, server, middleware
│   │       │   ├── mercadopago/
│   │       │   ├── meta/       # whatsapp.ts + instagram.ts
│   │       │   ├── football/   # football-data.org
│   │       │   ├── geolocation/
│   │       │   └── qr/
│   │       ├── stores/         # Zustand (prodeStore)
│   │       ├── hooks/
│   │       └── types/
│   │
│   └── api/                    # NestJS 11 — backend REST
│       └── src/
│           ├── modules/        # Feature-based modules
│           │   ├── auth/
│           │   ├── businesses/
│           │   ├── participants/
│           │   ├── matches/
│           │   ├── predictions/     # ← scoring logic + lock
│           │   ├── leaderboard/     # ← rank calc + cache
│           │   ├── prizes/
│           │   ├── promos/
│           │   ├── notifications/   # ← WhatsApp + cron jobs
│           │   ├── instagram/       # ← publish podio
│           │   └── payments/        # ← MP webhook handler
│           ├── infrastructure/
│           │   └── supabase/
│           ├── shared/
│           │   └── guards/          # SupabaseAuthGuard
│           └── config/
│
├── packages/
│   ├── db/                     # @prode/db — TypeScript types from Supabase
│   └── shared/                 # @prode/shared — scoring, slugify, constants
│
├── supabase/
│   ├── migrations/             # SQL completo con RLS + funciones
│   └── functions/
│       └── sync-matches/       # Edge Function — sync football-data.org
│
├── docker-compose.yml
├── turbo.json
└── .env.example
```

## Inicio rápido

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Completar con tus claves (especialmente las de Supabase)

# 3. Vincular con Supabase
npx supabase login
npx supabase link --project-ref <TU_PROJECT_REF>

# 4. Aplicar la migración
npx supabase db push

# 5. Deployar Edge Function de sync
npx supabase functions deploy sync-matches

# 6. Correr en modo dev
npm run dev
```

## Flujos principales

### Registro de empresa
1. `/` → `/register` → Google OAuth (Supabase)
2. `/empresa/configuracion` → logo, colores, premios
3. `/empresa/dashboard` → link + QR generado
4. Pago MercadoPago Checkout Pro → webhook → upgrade de plan en DB

### Participante
1. `/{slug}` → login con nombre + email + celular + términos
2. Carrusel de promos geolocalizadas (Plan Pro)
3. Carga de pronósticos (bloqueados 5 min antes del partido)
4. Notificación WhatsApp de recordatorio + resultado

### Scoring automático
1. Cron cada 5 min: detecta partidos `finished` sin `scored_at`
2. Calcula puntos por predicción (3 exacto / 1 ganador / 0 error)
3. Llama `recalculate_leaderboard()` en Supabase
4. Envía notificaciones WhatsApp de resultado

### Publicar en Instagram
1. Panel empresa → Ranking → "Publicar en Instagram"
2. Preview del post en modal (phone mockup)
3. Editar caption + hashtags (van en descripción, no en imagen)
4. `POST /api/v1/instagram/publish` → Graph API v22 → post publicado

## Variables de entorno requeridas

Ver `.env.example` para la lista completa.
# prode-argento
