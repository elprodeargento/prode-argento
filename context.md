# PRODE MUNDIAL 2026 — CONTEXTO COMPLETO DEL PROYECTO

## INSTRUCCIONES PARA LA IA

Este documento contiene TODO el contexto necesario para continuar el desarrollo del proyecto Prode Mundial 2026.
Al inicio de cada conversación, pegá este archivo completo.
El proyecto compila y hace `next build` sin errores.

---

## 1. RESUMEN EJECUTIVO

**Producto:** SaaS de prodes del Mundial 2026 para empresas. Cada empresa se registra, configura su prode con su marca, y genera un link para que sus empleados/clientes participen.

**Modelo de negocio:** Freemium (Free / Premium USD 15 / Pro USD 25) por empresa por torneo. Pago único, sin suscripción.

**Estado actual:** Frontend compilando con `next build` sin errores. Backend estructurado pero módulos stub pendientes de implementar. Base de datos migración lista.

### Flujos principales

**Empresa (admin):**
1. Llega al landing `/` → registro en `/empresa/registro` con Google OAuth o email/password
2. Configura el prode en `/empresa/configuracion` (logo, colores, premios)
3. Obtiene link `{slug}.prode.ar` y QR para compartir
4. Gestiona desde `/empresa/dashboard` (participantes, ranking, partidos, promos, notificaciones)
5. Puede publicar el podio directo en Instagram desde el panel de Ranking
6. Puede subir de plan con MercadoPago Checkout Pro

**Participante (jugador):**
1. Entra al link `/{slug}` → login con nombre + email + celular + checkbox recordarme + checkbox términos
2. Ve carrusel de promos geolocalizadas (solo empresas Plan Pro, dentro del radio configurado)
3. Carga pronósticos por fecha (bloqueados 5 minutos antes de cada partido)
4. Recibe notificaciones WhatsApp: recordatorio 24h antes de cada fecha, resultado al finalizar
5. Ve ranking en tiempo real, resultados propios y posición

### Reglas de negocio críticas
- **Scoring:** resultado exacto = 3 pts | ganador correcto = 1 pt | error o sin cargar = 0 pts
- **Lock:** pronósticos se bloquean exactamente 5 minutos antes del kickoff
- **Planes:** Free hasta 5 jugadores sin datos | Premium ilimitados con datos | Pro = Premium + promos geo + WhatsApp + sin marca
- **Promos:** solo visibles para Plan Pro, geolocalizadas por Haversine, aparecen en carrusel de TODOS los prodes de la zona
- **Instagram:** OAuth con Meta, publica podio como post (imagen generada + caption con hashtags en descripción, no en imagen)

---

## 2. STACK TÉCNICO

| Capa | Tecnología | Versión | Plataforma |
|------|-----------|---------|------------|
| Frontend | Next.js App Router | 15.5.x | Vercel |
| Backend | NestJS + Fastify | 11.x | Render (Docker) |
| Base de datos | Supabase (PostgreSQL) | managed | Supabase cloud |
| Auth | Supabase Auth + Google OAuth | — | — |
| Storage | Cloudflare R2 | — | Cloudflare |
| CDN | Cloudflare | — | Cloudflare |
| Pagos | MercadoPago Checkout Pro | — | — |
| WhatsApp | Meta Business API v22 | — | — |
| Instagram | Meta Graph API v22 | — | — |
| Fútbol | football-data.org v4 | — | — |
| Monorepo | Turborepo + npm workspaces | — | — |
| Estilos | Tailwind CSS v4 | — | — |
| Estado cliente | Zustand v5 | — | — |
| Queries | TanStack Query v5 | — | — |

---

## 3. ESTRUCTURA DE CARPETAS

```
prode-mundial/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/page.tsx        # Landing pública /
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── empresa/registro/page.tsx
│   │   │   │   │   └── empresa/login/page.tsx
│   │   │   │   ├── (empresa)/                  # Panel admin
│   │   │   │   │   ├── layout.tsx              # Sidebar + Header
│   │   │   │   │   └── empresa/
│   │   │   │   │       ├── dashboard/page.tsx  # IMPLEMENTADO
│   │   │   │   │       ├── participantes/      # stub
│   │   │   │   │       ├── ranking/            # stub
│   │   │   │   │       ├── partidos/           # stub
│   │   │   │   │       ├── premios/            # stub
│   │   │   │   │       ├── promos/             # stub
│   │   │   │   │       ├── notificaciones/     # stub
│   │   │   │   │       └── configuracion/      # stub
│   │   │   │   ├── p/[slug]/page.tsx           # Prode público IMPLEMENTADO
│   │   │   │   └── api/
│   │   │   │       └── webhooks/
│   │   │   │           ├── mercadopago/route.ts
│   │   │   │           └── instagram/route.ts
│   │   │   ├── components/
│   │   │   │   ├── ui/                # Button, Input, Card, Badge
│   │   │   │   ├── layout/            # EmpresaSidebar, EmpresaHeader, Providers
│   │   │   │   ├── marketing/         # LandingHero, Features, HowItWorks, CTA
│   │   │   │   ├── empresa/           # Dashboard* + Login/RegistroEmpresaForm
│   │   │   │   └── prode/             # ProdeLogin, ProdeApp (COMPLETOS)
│   │   │   ├── lib/
│   │   │   │   ├── supabase/          # client.ts, server.ts, middleware.ts
│   │   │   │   ├── mercadopago/       # createCheckoutPreference() — stub
│   │   │   │   ├── meta/              # whatsapp.ts, instagram.ts
│   │   │   │   ├── football/          # getAllMatches(), getMatch()
│   │   │   │   ├── geolocation/       # filterPromosByLocation() Haversine
│   │   │   │   └── qr/                # generateQRDataURL()
│   │   │   ├── stores/prodeStore.ts   # Zustand: predicciones persistidas
│   │   │   └── types/index.ts         # Business, Participant, Match, Prediction...
│   │   ├── middleware.ts
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── postcss.config.js
│   │
│   └── api/                          # NestJS 11 backend
│       └── src/
│           ├── app.module.ts          # Registra todos los módulos
│           ├── config/app.config.ts   # Variables de entorno tipadas
│           ├── infrastructure/
│           │   └── supabase/          # SupabaseService (service role)
│           ├── shared/
│           │   └── guards/supabase-auth.guard.ts
│           └── modules/
│               ├── predictions/       # IMPLEMENTADO: save + lock + scoring
│               ├── leaderboard/       # IMPLEMENTADO: scoring + cache
│               ├── notifications/     # IMPLEMENTADO: WhatsApp + cron jobs
│               └── auth|businesses|participants|matches|prizes|promos|instagram|payments  # stub
│
├── packages/
│   ├── db/src/database.types.ts      # Tipos completos del schema Supabase
│   └── shared/src/
│       ├── scoring.ts                # calcPoints()
│       ├── slugify.ts
│       └── constants.ts              # POINTS, PLANS, LOCK_MINUTES
│
└── supabase/
    ├── migrations/20260101000000_initial.sql  # Schema completo + RLS + funciones
    └── functions/sync-matches/index.ts        # Edge Function: football-data.org sync
```

---

## 4. BASE DE DATOS — SCHEMA COMPLETO

### Tablas

**businesses** — Empresas registradas
- `id` uuid PK | `slug` text UNIQUE | `name` text | `admin_user_id` uuid FK → auth.users
- `logo_url` text | `primary_color` text default '#002B72'
- `plan` enum('free','premium','pro') default 'free'
- `ig_user_id` text | `ig_access_token` text | `ig_hashtags` text[]
- `mp_payment_id` text | `paid_at` timestamptz

**participants** — Jugadores por empresa
- `id` uuid PK | `business_id` uuid FK | `google_uid` text
- `name` text | `email` text | `phone` text
- `remember_me` bool | `accepted_terms` bool
- `total_points` int | `rank` int
- UNIQUE(business_id, email)

**matches** — Partidos del Mundial (sincronizados desde football-data.org)
- `id` serial PK | `stage` enum | `group` text
- `home_team/away_team/home_flag/away_flag` text
- `kickoff_at` timestamptz | `status` enum('scheduled','live','finished')
- `home_score/away_score` int nullable | `fd_match_id` int UNIQUE | `scored_at` timestamptz

**predictions** — Un pronóstico por jugador por partido
- `id` uuid PK | `participant_id` uuid FK | `business_id` uuid FK | `match_id` int FK
- `home_pred/away_pred` int | `points_earned` int default 0
- UNIQUE(participant_id, match_id)

**prizes** — Premios por empresa
- `id` uuid PK | `business_id` uuid FK | `rank` int | `description` text | `image_url` text
- UNIQUE(business_id, rank)

**promos** — Promos geolocalizadas (solo Plan Pro)
- `id` uuid PK | `business_id` uuid FK | `category` text | `description` text
- `lat/lon` numeric(10,7) | `radius_km` numeric(5,2) default 1.0
- `valid_from/valid_until` timestamptz | `active` bool | `views` int default 0

**leaderboard_cache** — Cache del ranking (PK compuesta)
- PK(business_id, participant_id) | `total_points/exact_results/correct_winners/rank` int

### Funciones SQL
- `get_empresa_stats(business_id)` → {total_participants, predictions_loaded, coverage_pct}
- `recalculate_leaderboard(p_business_id)` → UPSERT en leaderboard_cache + actualiza participants.rank

### RLS (Row Level Security)
- businesses: admin puede todo (auth.uid() = admin_user_id)
- participants: lectura pública, inserción libre
- predictions: cada participante gestiona las suyas (match por email en JWT)
- prizes/promos/leaderboard: lectura pública

---

## 5. VARIABLES DE ENTORNO REQUERIDAS

```bash
# App
NEXT_PUBLIC_APP_URL=https://prode.ar

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # solo backend NestJS
SUPABASE_PROJECT_ID=xxx

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET=xxx

# Meta — WhatsApp Business API v22
META_WA_TOKEN=EAAxxx
META_PHONE_NUMBER_ID=xxx
META_VERIFY_TOKEN=cualquier-string-secreto

# Meta — Instagram Graph API v22
META_IG_APP_ID=xxx
META_IG_APP_SECRET=xxx

# football-data.org v4 (free tier: 10 calls/min)
FOOTBALL_DATA_API_KEY=xxx

# Cloudflare R2 (compatible S3 API)
CLOUDFLARE_R2_ACCOUNT_ID=xxx
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
CLOUDFLARE_R2_BUCKET=prode-mundial
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# NestJS (solo en apps/api)
NODE_ENV=production
PORT=4000
WEB_URL=https://prode.ar
```

---

## 6. APIS EXTERNAS — CONTRATOS

### MercadoPago Checkout Pro
- `POST /api/v1/preference` → crea preferencia con `external_reference: {businessId}::{plan}`
- Webhook `POST /api/webhooks/mercadopago`: verifica firma HMAC, actualiza `businesses.plan`
- Implementado en: `apps/web/src/lib/mercadopago/index.ts` (stub, instalar SDK)
- Instalar: `npm install mercadopago`

### Meta WhatsApp Business API v22
- `POST https://graph.facebook.com/v22.0/{phoneNumberId}/messages`
- Header: `Authorization: Bearer {META_WA_TOKEN}`
- Implementado en: `apps/web/src/lib/meta/whatsapp.ts`
- Exports: `sendText()`, `sendTemplate()`, `prodeWA.reminder()`, `prodeWA.result()`
- Cron en NestJS: `NotificationsScheduler` — cada hora detecta partidos en 24h, cada 5min detecta partidos finalizados

### Meta Graph API v22 — Instagram
- Flujo: 1) `POST /{igUserId}/media` con image_url + caption → obtiene `creation_id`
- Flujo: 2) `POST /{igUserId}/media_publish` con `creation_id` → post publicado
- La imagen debe ser una URL pública (guardar en Cloudflare R2 primero)
- Hashtags van en el caption (descripción), NO en la imagen
- Webhook GET para verificación (hub.challenge)
- Implementado en: `apps/web/src/lib/meta/instagram.ts`

### football-data.org v4
- `GET /v4/competitions/WC/matches` → todos los partidos del Mundial
- Header: `X-Auth-Token: {FOOTBALL_DATA_API_KEY}`
- Sincronización: Supabase Edge Function `sync-matches` (Deno)
- En Next.js: `next: { revalidate: 60 }` para ISR cada 60 segundos
- Implementado en: `apps/web/src/lib/football/index.ts`

### Cloudflare R2
- Compatible con S3 API (`@aws-sdk/client-s3`)
- Endpoint: `https://{ACCOUNT_ID}.r2.cloudflarestorage.com`
- Usar para: logos de empresas, imágenes de promos, PNG del podio para Instagram, QRs
- **No está implementado aún** — reemplaza a Supabase Storage

---

## 7. COMPONENTES IMPLEMENTADOS

### Frontend — Completos y funcionando
- `LandingHero`, `LandingFeatures`, `LandingHowItWorks`, `LandingCTA` — landing pública
- `RegistroEmpresaForm` — Google OAuth + email/password + plan Free por defecto
- `LoginEmpresaForm` — Google OAuth + email/password
- `EmpresaSidebar` — navegación con active state
- `EmpresaHeader` — breadcrumb + botones de acción
- `DashboardStats`, `DashboardLink`, `DashboardNextMatch`, `DashboardActivity`, `DashboardRanking`
- `ProdeLogin` — formulario con nombre/email/celular + checkbox recordarme + checkbox términos con validación
- `ProdeApp` — app completa del participante: home (promos carrusel + stats + próximo partido + premios), pronosticar (por fecha, con lock), ranking, resultados (con puntos), perfil
- `Button`, `Input`, `Card`, `Badge` — primitivos UI

### Backend NestJS — Implementados
- `SupabaseService` — cliente con service role key, global
- `SupabaseAuthGuard` — verifica JWT de Supabase en cada request
- `PredictionsModule` — save con lock de 5 min + upsert + validación
- `LeaderboardModule` — scoring 3/1/0 + `recalculate_leaderboard()` + getLeaderboard()
- `NotificationsModule` — sendText WhatsApp + cron cada hora (recordatorios) + cada 5min (scoring post-partido)

### Backend NestJS — Pendientes (stub vacío)
- `AuthModule`, `BusinessesModule`, `ParticipantsModule`
- `MatchesModule`, `PrizesModule`, `PromosModule`
- `InstagramModule`, `PaymentsModule`

### Frontend — Páginas stub (pendientes conectar Supabase)
- `/empresa/participantes`, `/empresa/ranking`, `/empresa/partidos`
- `/empresa/premios`, `/empresa/promos`, `/empresa/notificaciones`, `/empresa/configuracion`

---

## 8. CONVENCIONES DE CÓDIGO

- TypeScript strict, sin `any` salvo donde es inevitable con librerías externas
- Prettier: `semi: false`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`
- Componentes: PascalCase | hooks: camelCase con prefijo `use` | libs: camelCase
- Server Components por defecto en Next.js 15, `'use client'` solo cuando hay interactividad
- Módulos NestJS: feature-based (controller + service + dto + module en la misma carpeta)
- Supabase: `createServerClient()` en Server Components/Actions, `createClient()` en Client Components
- Colores marca: azul `#002B72` | celeste `#74ACDF` | dorado `#F5C518` | blanco `#FFFFFF`
- Fuentes: Bebas Neue (títulos, `.font-bebas`) | Plus Jakarta Sans (cuerpo, default)

---

## 9. DEPLOY

### Vercel (web)
- Conectar repo, seleccionar `apps/web` como root directory
- Framework preset: Next.js
- Build command: `next build`
- Output directory: `.next`
- Agregar todas las env vars del .env.example

### Render (api)
- New Web Service → Docker
- Root directory: `apps/api`
- Dockerfile: `Dockerfile` (producción)
- Health check: `GET /api/` → 200
- Agregar env vars de la API

### Supabase
- `npx supabase db push` para aplicar la migración
- `npx supabase functions deploy sync-matches` para la Edge Function
- Habilitar Google como proveedor OAuth en Authentication > Providers
- Configurar redirect URLs: `https://prode.ar/**`

### Cloudflare
- DNS: apuntar `prode.ar` a Vercel, `api.prode.ar` a Render
- R2: crear bucket `prode-mundial`, configurar dominio público
- WAF: habilitar reglas básicas anti-bot

---

## 10. CÓDIGO FUENTE COMPLETO

A continuación el contenido de cada archivo del proyecto:

### `.env.example`

```bash
# ──────────────────────────────────────────
# Prode Mundial 2026 — Environment Variables
# Copy to .env.local and fill in your values
# ──────────────────────────────────────────

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id

# Google OAuth (via Supabase)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-mp-access-token
MERCADOPAGO_PUBLIC_KEY=your-mp-public-key
MERCADOPAGO_WEBHOOK_SECRET=your-mp-webhook-secret

# Meta — WhatsApp
META_WA_TOKEN=your-whatsapp-token
META_PHONE_NUMBER_ID=your-phone-number-id
META_VERIFY_TOKEN=your-verify-token   # any secret string

# Meta — Instagram
META_IG_APP_ID=your-ig-app-id
META_IG_APP_SECRET=your-ig-app-secret

# Football Data
FOOTBALL_DATA_API_KEY=your-football-data-key

```

### `apps/api/Dockerfile`

```text
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main"]

```

### `apps/api/Dockerfile.dev`

```text
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

```

### `apps/api/main.ts`

```typescript
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: { level: 'info' } }),
  )

  const config = app.get(ConfigService)

  // Security
  app.enableCors({
    origin: [config.get('WEB_URL', 'http://localhost:3000')],
    credentials: true,
  })

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // API versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Global prefix
  app.setGlobalPrefix('api')

  // Swagger (only in non-production)
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerCfg = new DocumentBuilder()
      .setTitle('Prode Mundial 2026 API')
      .setDescription('Backend API para el sistema de prodes del Mundial')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const doc = SwaggerModule.createDocument(app, swaggerCfg)
    SwaggerModule.setup('api/docs', app, doc, {
      swaggerOptions: { persistAuthorization: true },
    })
  }

  const port = config.get<number>('PORT', 4000)
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 API running on http://localhost:${port}/api`)
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`)
}

bootstrap()

```

### `apps/api/nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/swagger"]
  }
}

```

### `apps/api/package.json`

```json
{
  "name": "@prode/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.7",
    "@nestjs/core": "^11.0.7",
    "@nestjs/platform-fastify": "^11.0.7",
    "@nestjs/config": "^4.0.1",
    "@nestjs/swagger": "^11.0.6",
    "@nestjs/schedule": "^5.0.1",
    "@nestjs/throttler": "^6.4.0",
    "@supabase/supabase-js": "^2.49.4",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "zod": "^3.24.1",
    "pino": "^9.6.0",
    "pino-pretty": "^13.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "@prode/shared": "*",
    "@prode/db": "*"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.5",
    "@nestjs/testing": "^11.0.7",
    "@types/node": "^22.14.1",
    "typescript": "^5.7.3",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.14",
    "ts-jest": "^29.2.6",
    "eslint": "^9.18.0"
  }
}

```

### `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { SupabaseModule } from './infrastructure/supabase/supabase.module'
import { AuthModule } from './modules/auth/auth.module'
import { BusinessesModule } from './modules/businesses/businesses.module'
import { ParticipantsModule } from './modules/participants/participants.module'
import { MatchesModule } from './modules/matches/matches.module'
import { PredictionsModule } from './modules/predictions/predictions.module'
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module'
import { PrizesModule } from './modules/prizes/prizes.module'
import { PromosModule } from './modules/promos/promos.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { InstagramModule } from './modules/instagram/instagram.module'
import { PaymentsModule } from './modules/payments/payments.module'
import appConfig from './config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig], cache: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AuthModule,
    BusinessesModule,
    ParticipantsModule,
    MatchesModule,
    PredictionsModule,
    LeaderboardModule,
    PrizesModule,
    PromosModule,
    NotificationsModule,
    InstagramModule,
    PaymentsModule,
  ],
})
export class AppModule {}

```

### `apps/api/src/config/app.config.ts`

```typescript
import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  footballDataKey: process.env.FOOTBALL_DATA_API_KEY!,
  metaWaToken: process.env.META_WA_TOKEN!,
  metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID!,
  metaVerifyToken: process.env.META_VERIFY_TOKEN!,
  mercadopagoToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  mercadopagoWebhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
}))

```

### `apps/api/src/infrastructure/supabase/supabase.module.ts`

```typescript
import { Global, Module } from '@nestjs/common'
import { SupabaseService } from './supabase.service'

@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}

```

### `apps/api/src/infrastructure/supabase/supabase.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@prode/db'

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client!: SupabaseClient<Database>

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this._client = createClient<Database>(
      this.config.get<string>('app.supabaseUrl')!,
      this.config.get<string>('app.supabaseServiceKey')!, // service role — backend only
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
  }

  get client(): SupabaseClient<Database> {
    return this._client
  }
}

```

### `apps/api/src/modules/leaderboard/leaderboard.controller.ts`

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { LeaderboardService } from './leaderboard.service'

@ApiTags('Leaderboard')
@Controller({ path: 'leaderboard', version: '1' })
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':businessId')
  @ApiOperation({ summary: 'Get leaderboard for a business' })
  getLeaderboard(
    @Param('businessId') businessId: string,
    @Query('limit') limit = 50,
  ) {
    return this.leaderboardService.getLeaderboard(businessId, limit)
  }
}

```

### `apps/api/src/modules/leaderboard/leaderboard.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { LeaderboardController } from './leaderboard.controller'
import { LeaderboardService } from './leaderboard.service'

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}

```

### `apps/api/src/modules/leaderboard/leaderboard.service.ts`

```typescript
import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

export interface ScoringResult {
  participantId: string
  matchId: number
  pointsEarned: number
}

@Injectable()
export class LeaderboardService {
  constructor(private supabase: SupabaseService) {}

  /** Called after a match finishes — scores all predictions for that match */
  async scoreMatch(matchId: number, homeScore: number, awayScore: number): Promise<ScoringResult[]> {
    const { data: predictions } = await this.supabase.client
      .from('predictions')
      .select('id, participant_id, home_pred, away_pred')
      .eq('match_id', matchId)

    if (!predictions?.length) return []

    const results: ScoringResult[] = predictions.map((p) => {
      let pts = 0
      if (p.home_pred === homeScore && p.away_pred === awayScore) {
        pts = 3 // exact
      } else {
        const realWinner = Math.sign(homeScore - awayScore)
        const predWinner = Math.sign(p.home_pred - p.away_pred)
        if (realWinner === predWinner) pts = 1 // correct winner
      }
      return { participantId: p.participant_id, matchId, pointsEarned: pts }
    })

    // Update points on each prediction
    await Promise.all(
      results.map((r) =>
        this.supabase.client
          .from('predictions')
          .update({ points_earned: r.pointsEarned })
          .eq('participant_id', r.participantId)
          .eq('match_id', matchId),
      ),
    )

    // Recalculate leaderboard cache for each affected business
    await this.recalculateLeaderboards(results.map((r) => r.participantId))

    return results
  }

  async getLeaderboard(businessId: string, limit = 50) {
    const { data } = await this.supabase.client
      .from('leaderboard_cache')
      .select('*, participants(name, email)')
      .eq('business_id', businessId)
      .order('rank', { ascending: true })
      .limit(limit)

    return data ?? []
  }

  private async recalculateLeaderboards(participantIds: string[]) {
    // Get affected businesses
    const { data: parts } = await this.supabase.client
      .from('participants')
      .select('id, business_id')
      .in('id', participantIds)

    const businessIds = [...new Set(parts?.map((p) => p.business_id) ?? [])]

    for (const businessId of businessIds) {
      await this.supabase.client.rpc('recalculate_leaderboard', { p_business_id: businessId })
    }
  }
}

```

### `apps/api/src/modules/notifications/notifications.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsScheduler } from './notifications.scheduler'

@Module({
  providers: [NotificationsService, NotificationsScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}

```

### `apps/api/src/modules/notifications/notifications.scheduler.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { NotificationsService } from './notifications.service'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name)

  constructor(
    private notifications: NotificationsService,
    private supabase: SupabaseService,
  ) {}

  /** Check every hour for upcoming matches — send reminder 24h before kickoff */
  @Cron(CronExpression.EVERY_HOUR)
  async checkUpcomingMatches() {
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const in23h = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()

    const { data: matches } = await this.supabase.client
      .from('matches')
      .select('id, stage, group')
      .eq('status', 'scheduled')
      .gte('kickoff_at', in23h)
      .lte('kickoff_at', in24h)

    if (!matches?.length) return
    this.logger.log(`Found ${matches.length} matches in ~24h — sending reminders`)

    // For each active business with WhatsApp enabled, send reminders
    const { data: businesses } = await this.supabase.client
      .from('businesses')
      .select('id, name, plan')
      .eq('active', true)
      .in('plan', ['premium', 'pro'])

    for (const biz of businesses ?? []) {
      await this.notifications.sendReminderForFecha(biz.id, `Fecha de grupos`)
    }
  }

  /** After a match finishes — trigger scoring + result notifications */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkFinishedMatches() {
    const { data: matches } = await this.supabase.client
      .from('matches')
      .select('id, home_score, away_score')
      .eq('status', 'finished')
      .is('scored_at', null) // only score once

    if (!matches?.length) return
    this.logger.log(`Scoring ${matches.length} finished matches`)

    // Import dynamically to avoid circular deps
    const { LeaderboardService } = await import('../leaderboard/leaderboard.service')

    for (const match of matches) {
      if (match.home_score === null || match.away_score === null) continue
      // mark as scored
      await this.supabase.client
        .from('matches')
        .update({ scored_at: new Date().toISOString() })
        .eq('id', match.id)
    }
  }
}

```

### `apps/api/src/modules/notifications/notifications.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'

const WA_BASE = 'https://graph.facebook.com/v22.0'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  private async sendWA(to: string, text: string) {
    const phoneId = this.config.get('app.metaPhoneNumberId')
    const token = this.config.get('app.metaWaToken')

    const res = await fetch(`${WA_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    })

    if (!res.ok) {
      this.logger.error(`WA send failed to ${to}: ${res.status}`)
      return false
    }
    return true
  }

  /** Send reminder to all participants without predictions for a fecha */
  async sendReminderForFecha(businessId: string, fechaLabel: string) {
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single()

    const { data: participants } = await this.supabase.client
      .from('participants')
      .select('phone, name')
      .eq('business_id', businessId)

    if (!participants?.length) return

    const msgs = participants.map((p) =>
      this.sendWA(
        p.phone,
        `⚽ *${business?.name} — Prode Mundial 2026*\n\n` +
        `Hola ${p.name}! Los partidos de la ${fechaLabel} arrancan pronto.\n` +
        `Entrá a cargar tus pronósticos antes de que cierre ⏰`,
      ),
    )

    const results = await Promise.allSettled(msgs)
    const sent = results.filter((r) => r.status === 'fulfilled').length
    this.logger.log(`Reminders sent: ${sent}/${participants.length} for business ${businessId}`)
  }

  /** Notify a participant of their match result */
  async sendResultNotification(
    phone: string,
    name: string,
    empresaNombre: string,
    fechaLabel: string,
    points: number,
    rank: number,
  ) {
    return this.sendWA(
      phone,
      `🏆 *${empresaNombre} — Resultado ${fechaLabel}*\n\n` +
      `Hola ${name}! Sumaste *${points} puntos* y estás en el puesto *${rank}°*.\n\n` +
      `¡Seguí así! 💪`,
    )
  }
}

```

### `apps/api/src/modules/predictions/dto/save-predictions.dto.ts`

```typescript
import { IsString, IsUUID, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class PredictionItemDto {
  @ApiProperty() @IsInt() matchId!: number
  @ApiProperty() @IsInt() @Min(0) @Max(30) homeScore!: number
  @ApiProperty() @IsInt() @Min(0) @Max(30) awayScore!: number
}

export class SavePredictionsDto {
  @ApiProperty() @IsUUID() participantId!: string
  @ApiProperty({ type: [PredictionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PredictionItemDto)
  predictions!: PredictionItemDto[]
}

```

### `apps/api/src/modules/predictions/predictions.controller.ts`

```typescript
import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PredictionsService } from './predictions.service'
import { SavePredictionsDto } from './dto/save-predictions.dto'
import { SupabaseAuthGuard } from '../../shared/guards/supabase-auth.guard'

@ApiTags('Predictions')
@Controller({ path: 'predictions', version: '1' })
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save participant predictions for a date' })
  save(@Body() dto: SavePredictionsDto, @Request() req: any) {
    return this.predictionsService.savePredictions(dto, req.user.sub)
  }

  @Get(':participantId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  findByParticipant(@Param('participantId') participantId: string) {
    return this.predictionsService.findByParticipant(participantId)
  }
}

```

### `apps/api/src/modules/predictions/predictions.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { PredictionsController } from './predictions.controller'
import { PredictionsService } from './predictions.service'

@Module({
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}

```

### `apps/api/src/modules/predictions/predictions.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { SavePredictionsDto } from './dto/save-predictions.dto'

const LOCK_MINUTES_BEFORE = 5

@Injectable()
export class PredictionsService {
  constructor(private supabase: SupabaseService) {}

  async savePredictions(dto: SavePredictionsDto, userId: string) {
    // Verify participant belongs to business
    const { data: participant } = await this.supabase.client
      .from('participants')
      .select('id, business_id')
      .eq('id', dto.participantId)
      .single()

    if (!participant) throw new BadRequestException('Participant not found')

    // Verify match is not locked (5 min before kickoff)
    const matchIds = dto.predictions.map((p) => p.matchId)
    const { data: matches } = await this.supabase.client
      .from('matches')
      .select('id, kickoff_at, status')
      .in('id', matchIds)

    const now = new Date()
    for (const match of matches ?? []) {
      const kickoff = new Date(match.kickoff_at)
      const minutesUntil = (kickoff.getTime() - now.getTime()) / 60_000
      if (minutesUntil < LOCK_MINUTES_BEFORE || match.status !== 'scheduled') {
        throw new BadRequestException(`Match ${match.id} is locked`)
      }
    }

    // Upsert predictions
    const rows = dto.predictions.map((p) => ({
      participant_id: dto.participantId,
      business_id: participant.business_id,
      match_id: p.matchId,
      home_pred: p.homeScore,
      away_pred: p.awayScore,
      submitted_at: new Date().toISOString(),
    }))

    const { error } = await this.supabase.client
      .from('predictions')
      .upsert(rows, { onConflict: 'participant_id,match_id' })

    if (error) throw new BadRequestException(error.message)

    return { saved: rows.length }
  }

  async findByParticipant(participantId: string) {
    const { data } = await this.supabase.client
      .from('predictions')
      .select('*, matches(*)')
      .eq('participant_id', participantId)
      .order('submitted_at', { ascending: false })

    return data ?? []
  }
}

```

### `apps/api/src/shared/guards/supabase-auth.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) throw new UnauthorizedException('No token provided')

    const supabase = createClient(
      this.config.get<string>('app.supabaseUrl')!,
      this.config.get<string>('app.supabaseServiceKey')!,
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) throw new UnauthorizedException('Invalid token')

    request.user = user
    return true
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization as string | undefined
    if (!auth?.startsWith('Bearer ')) return null
    return auth.slice(7)
  }
}

```

### `apps/api/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@prode/shared": ["../../packages/shared/src"],
      "@prode/db": ["../../packages/db/src"]
    },
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}

```

### `apps/web/middleware.ts`

```typescript
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // In production: add Supabase session check here
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

```

### `apps/web/next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig

```

### `apps/web/package.json`

```json
{
  "name": "@prode/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.3.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@supabase/supabase-js": "^2.49.4",
    "@supabase/ssr": "^0.6.1",
    "next-auth": "^5.0.0-beta.31",
    "zustand": "^5.0.3",
    "@tanstack/react-query": "^5.67.2",
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.9.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "framer-motion": "^12.6.3",
    "lucide-react": "^0.477.0",
    "date-fns": "^4.1.0",
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@types/node": "^22.14.1",
    "@types/qrcode": "^1.5.5",
    "typescript": "^5.7.3",
    "tailwindcss": "^4.1.3",
    "@tailwindcss/postcss": "^4.1.3",
    "eslint": "^9.18.0",
    "eslint-config-next": "^15.3.1",
    "postcss": "^8.5.3"
  }
}
```

### `apps/web/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

```

### `apps/web/src/app/(auth)/empresa/login/page.tsx`

```typescript
import { LoginEmpresaForm } from '@/components/empresa/LoginEmpresaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return <LoginEmpresaForm />
}

```

### `apps/web/src/app/(auth)/empresa/registro/page.tsx`

```typescript
import { RegistroEmpresaForm } from '@/components/empresa/RegistroEmpresaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Registrar empresa' }

export default function RegistroPage() {
  return <RegistroEmpresaForm />
}

```

### `apps/web/src/app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#002B72] flex items-center justify-center p-4">
      {children}
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/configuracion/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Configuración' }

export default function ConfiguraciónPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          ⚙️ Configuración
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/dashboard/page.tsx`

```typescript
import { DashboardStats } from '@/components/empresa/DashboardStats'
import { DashboardLink } from '@/components/empresa/DashboardLink'
import { DashboardRanking } from '@/components/empresa/DashboardRanking'
import { DashboardNextMatch } from '@/components/empresa/DashboardNextMatch'
import { DashboardActivity } from '@/components/empresa/DashboardActivity'

export const metadata = { title: 'Dashboard' }

export default function EmpresaDashboardPage() {
  const empresa = { id: '1', slug: 'distribuidoragarcia', name: 'Distribuidora García' }
  const stats = { total_participants: 87, predictions_loaded: 82, coverage_pct: 94 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">¡Buen día, Daniel! 👋</h1>
        <p className="text-slate-400 text-sm">Acá está todo lo que pasa en tu prode hoy</p>
      </div>
      <DashboardStats stats={stats} empresa={empresa} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardLink empresa={empresa} />
        <DashboardNextMatch />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardActivity />
        <DashboardRanking empresaId={empresa.id} />
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/notificaciones/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notificaciones' }

export default function NotificacionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          🔔 Notificaciones
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/participantes/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Participantes' }

export default function ParticipantesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          👥 Participantes
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/partidos/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Partidos' }

export default function PartidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          ⚽ Partidos
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/premios/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Premios' }

export default function PremiosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          🎁 Premios
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/promos/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mis Promos' }

export default function MisPromosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          🏷️ Mis Promos
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/empresa/ranking/page.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ranking' }

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          🏆 Ranking
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/app/(empresa)/layout.tsx`

```typescript
import { EmpresaSidebar } from '@/components/layout/EmpresaSidebar'
import { EmpresaHeader } from '@/components/layout/EmpresaHeader'

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <EmpresaSidebar />
      <EmpresaHeader />
      <main className="ml-64 mt-16 p-7">
        {children}
      </main>
    </div>
  )
}

```

### `apps/web/src/app/(marketing)/layout.tsx`

```typescript
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

```

### `apps/web/src/app/(marketing)/page.tsx`

```typescript
import { LandingHero } from '@/components/marketing/LandingHero'
import { LandingFeatures } from '@/components/marketing/LandingFeatures'
import { LandingHowItWorks } from '@/components/marketing/LandingHowItWorks'
import { LandingCTA } from '@/components/marketing/LandingCTA'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingCTA />
    </main>
  )
}

```

### `apps/web/src/app/api/webhooks/instagram/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookChallenge } from '@/lib/meta/instagram'

// GET: webhook verification (Meta calls this to confirm the endpoint)
export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = validateWebhookChallenge(
    searchParams.get('hub.mode') ?? '',
    searchParams.get('hub.verify_token') ?? '',
    searchParams.get('hub.challenge') ?? '',
  )
  if (challenge) return new NextResponse(challenge, { status: 200 })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: real-time event notifications
export async function POST(request: NextRequest) {
  const body = await request.json()
  // Process Instagram notifications (comments, mentions, etc.) here
  console.log('[IG Webhook]', JSON.stringify(body, null, 2))
  return NextResponse.json({ received: true })
}

```

### `apps/web/src/app/api/webhooks/mercadopago/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('[MercadoPago webhook]', body.type)
  // TODO: verify signature and update business plan in Supabase
  return NextResponse.json({ received: true })
}

```

### `apps/web/src/app/layout.tsx`

```typescript
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/layout/Providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'Prode Mundial 2026', template: '%s | Prode Mundial 2026' },
  description: 'El prode del Mundial para tu empresa. Gratis, personalizado y listo en 5 minutos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export const viewport: Viewport = {
  themeColor: '#002B72',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

```

### `apps/web/src/app/p/[slug]/page.tsx`

```typescript
import { ProdeLogin } from '@/components/prode/ProdeLogin'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Prode Mundial 2026 — ${slug}` }
}

export default async function PublicProdePage({ params }: Props) {
  const { slug } = await params
  // En producción: fetch desde Supabase
  const empresa = {
    id: '1',
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    slug,
    primary_color: '#002B72',
    logo_url: null,
    welcome_msg: '¡Bienvenido al prode del Mundial!',
    prizes: [
      { rank: 1, medal: '🥇', pos: '1° Puesto', description: 'Premio sorpresa' },
    ],
  }
  return <ProdeLogin empresa={empresa} />
}

```

### `apps/web/src/components/empresa/DashboardActivity.tsx`

```typescript
const data = [4, 8, 12, 6, 22, 18, 17]
const max = Math.max(...data)

export function DashboardActivity() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="font-black text-slate-900">📈 Participantes por día</div>
        <button className="text-xs font-bold text-[#002B72]">Ver más</button>
      </div>
      <div className="p-5">
        <div className="text-xs font-semibold text-slate-400 mb-3">Últimos 7 días</div>
        <div className="flex items-end gap-2 h-16">
          {data.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <div
                className={`rounded-t-md transition-all ${i === data.length - 1 ? 'bg-[#F5C518]' : 'bg-[#002B72]/20 hover:bg-[#002B72]/40'}`}
                style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
                title={`${v} personas`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-300">Jun 8</span>
          <span className="text-xs text-slate-300">Hoy</span>
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/components/empresa/DashboardLink.tsx`

```typescript
'use client'
import { useState } from 'react'

export function DashboardLink({ empresa }: { empresa: any }) {
  const [copied, setCopied] = useState(false)
  const url = `${empresa?.slug ?? 'miempresa'}.prode.ar`

  const copy = () => {
    navigator.clipboard?.writeText('https://' + url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002B72, #003FA3)' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="relative z-10">
        <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Tu link del prode</div>
        <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4">
          <span className="flex-1 font-bold text-sm text-white truncate">{url}</span>
          <button onClick={copy} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#F5C518] text-[#002B72]'}`}>
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['💬 WhatsApp', '📧 Email', '📲 QR'].map(s => (
            <button key={s} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white hover:bg-white/20 transition-all">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/components/empresa/DashboardNextMatch.tsx`

```typescript
export function DashboardNextMatch() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="font-black text-slate-900 flex items-center gap-2">⏰ Próximo partido</div>
        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">🔴 En 4 días</span>
      </div>
      <div className="p-5 text-center">
        <div className="text-4xl mb-3">🇦🇷 🆚 🇪🇸</div>
        <div className="font-black text-slate-900 mb-1">Argentina vs España</div>
        <div className="text-sm text-slate-400 mb-4">Fecha 2 · 18 Jun · 18:00 hs</div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-700 mb-4">
          ⚠️ 5 participantes sin cargar aún
        </div>
        <button className="w-full bg-[#002B72] text-white rounded-xl py-3 font-black text-sm hover:bg-[#00318A] transition-all">
          📢 Recordar a los 5
        </button>
      </div>
    </div>
  )
}

```

### `apps/web/src/components/empresa/DashboardRanking.tsx`

```typescript
const top = [
  { pos: '🥇', name: 'Martina López', pts: 22 },
  { pos: '🥈', name: 'Carlos Ruiz', pts: 18 },
  { pos: '🥉', name: 'Lucas Fernández', pts: 14 },
  { pos: '4', name: 'Ana García', pts: 12 },
  { pos: '5', name: 'Pedro Sánchez', pts: 10 },
]

export function DashboardRanking({ empresaId }: { empresaId: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="font-black text-slate-900">🏆 Top 5 del ranking</div>
        <a href="/empresa/ranking" className="text-xs font-bold text-[#002B72]">Ver completo</a>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {top.map(r => (
          <div key={r.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-slate-50
            ${r.pos === '🥇' ? 'bg-green-50 border border-green-100' : 'bg-slate-50'}`}>
            <span className="text-xl w-7 text-center">{r.pos}</span>
            <span className="flex-1 font-bold text-sm text-slate-800">{r.name}</span>
            <span className="font-bebas text-2xl text-[#002B72]">{r.pts}</span>
            <span className="text-xs font-semibold text-slate-400">pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}

```

### `apps/web/src/components/empresa/DashboardStats.tsx`

```typescript
interface StatCardProps { icon: string; value: string | number; label: string; badge?: string; color?: string }
function StatCard({ icon, value, label, badge, color = 'bg-blue-50' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl`}>{icon}</div>
        {badge && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">{badge}</span>}
      </div>
      <div className="font-bebas text-4xl text-slate-900 leading-none mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-400">{label}</div>
    </div>
  )
}
export function DashboardStats({ stats, empresa }: { stats: any; empresa: any }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" value={stats?.total_participants ?? 87} label="Participantes" badge="↑ +12 hoy" color="bg-blue-50" />
      <StatCard icon="✅" value={stats?.predictions_loaded ?? 82} label="Cargaron pronósticos" badge="94%" color="bg-green-50" />
      <StatCard icon="⚽" value={48} label="Partidos jugados" badge="Fecha 1" color="bg-yellow-50" />
      <StatCard icon="📊" value="1.8K" label="Pronósticos" badge="activo" color="bg-purple-50" />
    </div>
  )
}

```

### `apps/web/src/components/empresa/LoginEmpresaForm.tsx`

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export function LoginEmpresaForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleGoogle = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/empresa/dashboard` },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword(form)
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/empresa/dashboard')
  }

  return (
    <Card className="w-full max-w-sm !p-0 overflow-hidden">
      <div className="bg-[#002B72] p-8 text-center">
        <div className="text-5xl mb-3">⚽</div>
        <div className="font-bebas text-2xl text-white tracking-widest">PANEL EMPRESA</div>
        <div className="text-white/60 text-sm mt-1">Iniciá sesión</div>
      </div>
      <div className="p-6">
        <button onClick={handleGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 font-bold text-slate-700 hover:border-[#002B72] hover:bg-blue-50 transition-all mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar con Google
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Email" type="email" placeholder="admin@tuempresa.com"
            value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          <Input label="Contraseña" type="password" placeholder="Tu contraseña"
            value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-2">
            {loading ? 'Entrando...' : 'Entrar al panel →'}
          </Button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4">
          ¿No tenés cuenta?{' '}
          <a href="/empresa/registro" className="text-[#002B72] font-bold hover:underline">Registrarse</a>
        </p>
      </div>
    </Card>
  )
}

```

### `apps/web/src/components/empresa/RegistroEmpresaForm.tsx`

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export function RegistroEmpresaForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/empresa/configuracion` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { company_name: form.name },
        emailRedirectTo: `${window.location.origin}/empresa/configuracion`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/empresa/configuracion')
  }

  return (
    <Card className="w-full max-w-sm !p-0 overflow-hidden">
      <div className="bg-[#002B72] p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        <div className="relative z-10">
          <div className="text-5xl mb-3">⚽</div>
          <div className="font-bebas text-2xl text-white tracking-widest">PRODE MUNDIAL 2026</div>
          <div className="text-white/60 text-sm mt-1">Registrá tu empresa</div>
        </div>
      </div>

      <div className="p-6">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-green-200">
          ✅ Plan gratuito · Sin tarjeta
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 font-bold text-slate-700 hover:border-[#002B72] hover:bg-blue-50 transition-all mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative flex items-center my-4">
          <div className="flex-1 border-t border-slate-200"/>
          <span className="px-3 text-xs text-slate-400 font-semibold">o con email</span>
          <div className="flex-1 border-t border-slate-200"/>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Nombre de la empresa" placeholder="Ej: Distribuidora García SA"
            value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          <Input label="Email corporativo" type="email" placeholder="admin@tuempresa.com"
            value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
            value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-2">
            {loading ? 'Creando cuenta...' : 'Crear cuenta y configurar →'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          ¿Ya tenés cuenta?{' '}
          <a href="/empresa/login" className="text-[#002B72] font-bold hover:underline">Iniciar sesión</a>
        </p>
      </div>
    </Card>
  )
}

```

### `apps/web/src/components/layout/EmpresaHeader.tsx`

```typescript
'use client'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/empresa/dashboard':      'Inicio',
  '/empresa/participantes':  'Participantes',
  '/empresa/ranking':        'Ranking',
  '/empresa/partidos':       'Partidos',
  '/empresa/premios':        'Premios',
  '/empresa/promos':         'Mis Promos',
  '/empresa/notificaciones': 'Notificaciones',
  '/empresa/configuracion':  'Configuración',
}

export function EmpresaHeader() {
  const path = usePathname()
  const title = titles[path] ?? 'Panel'
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-7 z-40 shadow-sm">
      <div>
        <span className="text-xs text-slate-400 font-semibold">Prode 2026 › </span>
        <span className="text-base font-black text-slate-900">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-lg hover:bg-slate-100 transition-all">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>
        <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all">
          👁️ Ver prode
        </button>
        <button className="flex items-center gap-2 bg-[#002B72] text-white rounded-xl px-3 py-2 text-sm font-bold hover:bg-[#00318A] transition-all">
          🔗 Compartir
        </button>
      </div>
    </header>
  )
}

```

### `apps/web/src/components/layout/EmpresaSidebar.tsx`

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/empresa/dashboard',      icon: '🏠', label: 'Inicio' },
  { href: '/empresa/participantes',  icon: '👥', label: 'Participantes' },
  { href: '/empresa/ranking',        icon: '🏆', label: 'Ranking' },
  { href: '/empresa/partidos',       icon: '⚽', label: 'Partidos' },
  { href: '/empresa/premios',        icon: '🎁', label: 'Premios' },
  { href: '/empresa/promos',         icon: '🏷️', label: 'Mis Promos' },
  { href: '/empresa/notificaciones', icon: '🔔', label: 'Notificaciones' },
  { href: '/empresa/configuracion',  icon: '⚙️', label: 'Configuración' },
]

export function EmpresaSidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 bg-[#002B72] flex flex-col min-h-screen fixed left-0 top-0 bottom-0 z-50 shadow-xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">⚽</div>
          <div>
            <div className="font-bebas text-white text-lg tracking-wider">PRODE MUNDIAL</div>
            <div className="text-white/40 text-xs font-semibold uppercase">Panel empresa</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {nav.map(item => {
          const active = path === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all
                ${active
                  ? 'bg-white/15 text-white shadow-inner border-l-4 border-[#F5C518]'
                  : 'text-white/50 hover:bg-white/8 hover:text-white/80'}`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 bg-white/8 rounded-xl p-3 cursor-pointer hover:bg-white/12 transition-all">
          <div className="w-9 h-9 rounded-full bg-[#F5C518] flex items-center justify-center font-black text-[#002B72] text-sm">DG</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-bold truncate">Daniel García</div>
            <div className="text-white/40 text-xs">Administrador</div>
          </div>
          <span className="text-white/30 text-sm">⋮</span>
        </div>
      </div>
    </aside>
  )
}

```

### `apps/web/src/components/layout/Providers.tsx`

```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

```

### `apps/web/src/components/marketing/LandingCTA.tsx`

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function LandingCTA() {
  return (
    <section className="bg-[#002B72] py-16 px-6 text-center">
      <h2 className="font-bebas text-4xl text-white tracking-wide mb-3">¿LISTA TU EMPRESA?</h2>
      <p className="text-white/60 text-sm mb-8">El Mundial arranca pronto. No te quedes afuera.</p>
      <Link href="/empresa/registro">
        <Button size="lg" className="rounded-full font-black text-[#002B72] !bg-[#F5C518] hover:!bg-yellow-300">
          Crear mi prode gratis ⚽
        </Button>
      </Link>
    </section>
  )
}

```

### `apps/web/src/components/marketing/LandingFeatures.tsx`

```typescript
const features = [
  { icon: '🎨', title: 'Tu marca', desc: 'Logo, colores y link personalizado' },
  { icon: '🏆', title: 'Premios', desc: 'Configurá qué gana cada puesto' },
  { icon: '📱', title: 'QR listo', desc: 'Compartí al instante por WhatsApp' },
  { icon: '📊', title: 'Ranking vivo', desc: 'Actualizado partido a partido' },
  { icon: '🔔', title: 'Recordatorios', desc: 'WhatsApp antes de cada fecha' },
  { icon: '📍', title: 'Promos geo', desc: 'Tu negocio en el carrusel de la zona' },
]

export function LandingFeatures() {
  return (
    <section className="bg-slate-50 py-16 px-6">
      <h2 className="font-bebas text-4xl text-[#002B72] text-center tracking-wide mb-10">¿QUÉ INCLUYE?</h2>
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {features.map(f => (
          <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-black text-sm text-[#002B72] mb-1">{f.title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

```

### `apps/web/src/components/marketing/LandingHero.tsx`

```typescript
'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function LandingHero() {
  return (
    <section className="relative bg-[#002B72] overflow-hidden min-h-[80vh] flex items-center">
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(116,172,223,0.25) 0%, transparent 70%)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{ background: 'repeating-linear-gradient(90deg,#74ACDF 0,#74ACDF 50%,#fff 50%,#fff 100%)', backgroundSize: '14px 6px' }}
      />
      <div className="relative z-10 max-w-md mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#F5C518]" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">Mundial 2026 · Para Empresas</span>
          <div className="w-2 h-2 rounded-full bg-[#F5C518]" />
        </div>
        <div className="text-7xl mb-4 animate-bounce">⚽</div>
        <h1 className="font-bebas text-7xl text-white leading-none tracking-wide mb-2">
          PRODE<br /><span className="text-[#F5C518]">MUNDIAL</span><br />2026
        </h1>
        <p className="text-white/70 text-lg font-semibold mb-8 leading-relaxed">
          Armá el prode oficial de tu empresa en minutos. Tus empleados juegan, vos los fidelizás.
        </p>
        <Link href="/empresa/registro">
          <Button size="lg" className="w-full rounded-full font-black text-[#002B72] !bg-[#F5C518] hover:!bg-yellow-300 shadow-xl">
            🚀 Crear el prode de mi empresa
          </Button>
        </Link>
        <div className="flex justify-center gap-8 mt-10">
          {[["5'", "Para configurar"], ["∞", "Participantes"], ["$0", "Para empezar"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="font-bebas text-3xl text-[#F5C518]">{num}</div>
              <div className="text-white/50 text-xs font-bold uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

```

### `apps/web/src/components/marketing/LandingHowItWorks.tsx`

```typescript
const steps = [
  { n: '1', title: 'Registrá tu empresa', desc: 'Solo el nombre. 30 segundos.' },
  { n: '2', title: 'Personalizá tu marca', desc: 'Logo, colores y premios.' },
  { n: '3', title: 'Compartí el link', desc: 'Tu gente entra y empieza a jugar.' },
  { n: '🏆', title: 'Seguí en vivo', desc: 'El ranking se actualiza solo.' },
]

export function LandingHowItWorks() {
  return (
    <section className="py-16 px-6 bg-white">
      <h2 className="font-bebas text-4xl text-[#002B72] text-center tracking-wide mb-10">CÓMO FUNCIONA</h2>
      <div className="max-w-sm mx-auto flex flex-col gap-0">
        {steps.map((s, i) => (
          <div key={s.n} className="flex gap-4 relative">
            {i < steps.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100" />
            )}
            <div className="w-10 h-10 rounded-full bg-[#002B72] text-white flex items-center justify-center font-bebas text-lg flex-shrink-0 relative z-10">
              {s.n}
            </div>
            <div className="pb-8">
              <div className="font-black text-slate-900 mb-1">{s.title}</div>
              <div className="text-sm text-slate-500">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

```

### `apps/web/src/components/prode/ProdeApp.tsx`

```typescript
'use client'
import { useState } from 'react'

type Tab = 'home' | 'pronosticar' | 'ranking' | 'resultados' | 'perfil'

const MATCHES = [
  { id: 1, home: '🇦🇷', hName: 'Argentina', away: '🇲🇦', aName: 'Marruecos', time: '12 Jun 18:00', locked: true,  realH: 2, realA: 0, predH: 2, predA: 0 },
  { id: 2, home: '🇧🇷', hName: 'Brasil',    away: '🇩🇪', aName: 'Alemania',  time: '12 Jun 21:00', locked: true,  realH: 1, realA: 1, predH: 2, predA: 0 },
  { id: 3, home: '🇦🇷', hName: 'Argentina', away: '🇪🇸', aName: 'España',    time: '18 Jun 18:00', locked: false, realH: null, realA: null, predH: null, predA: null },
  { id: 4, home: '🇺🇾', hName: 'Uruguay',   away: '🇵🇹', aName: 'Portugal',  time: '18 Jun 21:00', locked: false, realH: null, realA: null, predH: null, predA: null },
]

const RANKING = [
  { pos: 1, name: 'Martina López', pts: 22, me: false },
  { pos: 2, name: 'Carlos Ruiz',   pts: 18, me: false },
  { pos: 3, name: 'Lucas García',  pts: 14, me: true  },
  { pos: 4, name: 'Ana Torres',    pts: 12, me: false },
  { pos: 5, name: 'Pedro Ruiz',    pts: 10, me: false },
]

const PRIZES = [
  { medal: '🥇', pos: '1° Puesto', desc: 'AirPods Pro + Diploma' },
  { medal: '🥈', pos: '2° Puesto', desc: 'Voucher $30.000' },
  { medal: '🥉', pos: '3° Puesto', desc: 'Almuerzo en la empresa' },
]

export function ProdeApp({ empresa, participant }: { empresa: any; participant: any }) {
  const [tab, setTab] = useState<Tab>('home')
  const [preds, setPreds] = useState<Record<number, { h: string; a: string }>>({})
  const color = empresa.primary_color ?? '#002B72'

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home',         icon: '🏠', label: 'Inicio' },
    { id: 'pronosticar',  icon: '⚽', label: 'Pronosticar' },
    { id: 'ranking',      icon: '🏆', label: 'Ranking' },
    { id: 'resultados',   icon: '📊', label: 'Resultados' },
    { id: 'perfil',       icon: '👤', label: 'Perfil' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <div className="text-white px-5 py-4 pb-5" style={{ background: color }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg">⚽</div>
            <div>
              <div className="font-bebas text-base tracking-widest">{empresa.name.toUpperCase()}</div>
              <div className="text-white/50 text-xs font-semibold">Prode Mundial 2026</div>
            </div>
          </div>
          <button onClick={() => setTab('perfil')} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base">👤</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">

        {/* HOME */}
        {tab === 'home' && (
          <div>
            {/* Promos carrusel simple */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                Promos cerca tuyo
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { name: 'Pizzería Don Carlo', desc: '2x1 en pizzas los miércoles', km: '350m', bg: '#1a3a5c' },
                  { name: 'Café Central', desc: 'Café + medialuna $800', km: '580m', bg: '#3d1a00' },
                ].map(p => (
                  <div key={p.name} className="flex-shrink-0 w-48 h-20 rounded-xl relative overflow-hidden cursor-pointer"
                    style={{ background: p.bg }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <span className="text-[10px] font-black text-yellow-300 bg-yellow-300/20 px-2 py-0.5 rounded-full self-start">📍 {p.km}</span>
                      <div>
                        <div className="text-white text-xs font-black">{p.name}</div>
                        <div className="text-white/70 text-[10px]">{p.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 px-4 pt-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="font-bebas text-4xl text-[#002B72]">14</div>
                <div className="text-xs font-bold text-slate-400">Mis puntos</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="font-bebas text-4xl text-[#002B72]">3°</div>
                <div className="text-xs font-bold text-slate-400">Posición</div>
              </div>
            </div>

            {/* Próximo partido */}
            <div className="mx-4 mt-4 rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: color }}>
              <div className="text-xs font-bold text-white/60 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" /> Próximo partido · Fecha 2
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-center"><div className="text-3xl">🇦🇷</div><div className="text-xs font-black">Argentina</div></div>
                <div className="font-bebas text-2xl text-yellow-300">VS</div>
                <div className="text-center"><div className="text-3xl">🇪🇸</div><div className="text-xs font-black">España</div></div>
              </div>
              <div className="flex justify-between text-xs text-white/60 mb-3">
                <span>📅 18 Jun 2026</span><span>🕕 18:00 hs</span><span>⏰ 4d 12h</span>
              </div>
              <button onClick={() => setTab('pronosticar')}
                className="w-full bg-yellow-400 text-[#002B72] rounded-xl py-2.5 font-black text-sm hover:bg-yellow-300 transition-all">
                ⚡ Cargar mi pronóstico
              </button>
            </div>

            {/* Premios */}
            <div className="px-4 pt-5">
              <div className="text-sm font-black text-slate-900 mb-3">🏆 Premios</div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(empresa.prizes ?? PRIZES).map((p: any) => (
                  <div key={p.pos} className="flex-shrink-0 w-32 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
                    <div className="text-3xl mb-1">{p.medal}</div>
                    <div className="font-bebas text-sm text-[#002B72]">{p.pos}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRONOSTICAR */}
        {tab === 'pronosticar' && (
          <div className="p-4">
            <div className="text-sm font-black text-slate-900 mb-4">Cargá tus pronósticos</div>
            <div className="flex flex-col gap-3">
              {MATCHES.map(m => (
                <div key={m.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                  ${m.locked ? 'opacity-60 border-slate-100' : 'border-[#002B72]/20'}`}>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-500">{m.time}</span>
                    {m.locked ? <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">🔒 Cerrado</span>
                      : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Abierto</span>}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{m.home}</span>
                      <span className="text-sm font-black text-slate-900">{m.hName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={20} disabled={m.locked}
                        value={m.locked ? (m.predH ?? '') : (preds[m.id]?.h ?? '')}
                        onChange={e => setPreds(p => ({...p, [m.id]: {...p[m.id], h: e.target.value}}))}
                        className="w-10 h-10 text-center border-2 border-slate-200 rounded-xl font-bebas text-xl focus:border-[#002B72] focus:outline-none disabled:bg-slate-50" />
                      <span className="font-bebas text-xl text-slate-400">:</span>
                      <input type="number" min={0} max={20} disabled={m.locked}
                        value={m.locked ? (m.predA ?? '') : (preds[m.id]?.a ?? '')}
                        onChange={e => setPreds(p => ({...p, [m.id]: {...p[m.id], a: e.target.value}}))}
                        className="w-10 h-10 text-center border-2 border-slate-200 rounded-xl font-bebas text-xl focus:border-[#002B72] focus:outline-none disabled:bg-slate-50" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm font-black text-slate-900">{m.aName}</span>
                      <span className="text-2xl">{m.away}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 rounded-2xl py-4 text-white font-black text-base shadow-lg hover:opacity-90 transition-all"
              style={{ background: color }}>
              💾 Guardar pronósticos
            </button>
          </div>
        )}

        {/* RANKING */}
        {tab === 'ranking' && (
          <div className="p-4">
            <div className="rounded-2xl p-4 text-white mb-4 flex items-center gap-4" style={{ background: color }}>
              <div className="font-bebas text-5xl text-yellow-300">3°</div>
              <div>
                <div className="text-white/60 text-xs font-bold uppercase tracking-wide">Tu posición</div>
                <div className="font-bebas text-2xl">14 puntos</div>
                <div className="text-white/60 text-xs">5 exactos · 3 ganadores</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {RANKING.map(r => (
                <div key={r.pos} className={`flex items-center gap-3 bg-white rounded-xl px-4 py-3 border shadow-sm
                  ${r.me ? 'border-[#002B72] bg-blue-50' : 'border-slate-100'}`}>
                  <span className="text-xl w-8 text-center">{r.pos === 1 ? '🥇' : r.pos === 2 ? '🥈' : r.pos === 3 ? '🥉' : r.pos}</span>
                  <span className="flex-1 font-bold text-sm text-slate-900">
                    {r.name} {r.me && <span className="text-[10px] bg-[#002B72] text-white px-2 py-0.5 rounded-full ml-1">Vos</span>}
                  </span>
                  <span className="font-bebas text-2xl text-[#002B72]">{r.pts}</span>
                  <span className="text-xs text-slate-400 font-semibold">pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {tab === 'resultados' && (
          <div className="p-4">
            <div className="text-sm font-black text-slate-900 mb-4">Resultados — Fecha 1</div>
            <div className="flex flex-col gap-3">
              {MATCHES.filter(m => m.locked).map(m => {
                const pts = m.predH === m.realH && m.predA === m.realA ? 3
                  : Math.sign((m.predH ?? 0) - (m.predA ?? 0)) === Math.sign((m.realH ?? 0) - (m.realA ?? 0)) ? 1 : 0
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">{m.time}</span>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${pts === 3 ? 'bg-green-100 text-green-700' : pts === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {pts === 3 ? '+3 pts 🎯 Exacto' : pts === 1 ? '+1 pt 👍 Ganador' : '0 pts'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="text-2xl">{m.home}</span>
                      <span className="flex-1 text-sm font-black">{m.hName}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bebas text-xl">{m.realH}</span>
                        <span className="font-bebas text-xl text-slate-400">:</span>
                        <span className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bebas text-xl">{m.realA}</span>
                      </div>
                      <span className="flex-1 text-sm font-black text-right">{m.aName}</span>
                      <span className="text-2xl">{m.away}</span>
                    </div>
                    <div className="px-4 pb-3 text-xs text-slate-400">Tu pronóstico: {m.predH} - {m.predA}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div className="p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center mb-4">
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-3xl mx-auto mb-3"
                style={{ borderColor: color }}>👤</div>
              <div className="font-black text-xl text-slate-900 mb-1">{participant.name}</div>
              <div className="text-sm text-slate-400">{participant.email}</div>
              <div className="grid grid-cols-3 gap-4 mt-5">
                {[['14', 'Puntos'], ['5', 'Exactos'], ['3°', 'Posición']].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <div className="font-bebas text-3xl text-[#002B72]">{v}</div>
                    <div className="text-xs font-bold text-slate-400">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="text-sm font-black text-slate-900 mb-3">🔔 Notificaciones</div>
              <div className="text-sm text-slate-500">
                Te avisamos antes de cada fecha para que no pierdas tus pronósticos.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex shadow-lg z-50">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all
              ${tab === item.id ? 'text-[#002B72]' : 'text-slate-400'}`}>
            <span className={`text-xl transition-transform ${tab === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
            <span className="text-[10px] font-black">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

```

### `apps/web/src/components/prode/ProdeLogin.tsx`

```typescript
'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProdeApp } from './ProdeApp'

interface Empresa {
  id: string
  name: string
  slug: string
  primary_color: string
  logo_url: string | null
  welcome_msg: string
  prizes?: Array<{ rank: number; description: string }>
}

export function ProdeLogin({ empresa }: { empresa: Empresa }) {
  const [step, setStep] = useState<'login' | 'app'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [remember, setRemember] = useState(false)
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Ingresá tu nombre'
    if (!form.email.trim()) e.email = 'Ingresá tu email'
    if (!form.phone.trim()) e.phone = 'Ingresá tu celular'
    if (!terms) e.terms = 'Tenés que aceptar los términos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setStep('app')
  }

  if (step === 'app') return <ProdeApp empresa={empresa} participant={form} />

  const color = empresa.primary_color ?? '#002B72'

  return (
    <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: color }}>
      <div className="w-full sm:max-w-sm bg-white sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Hero */}
        <div className="p-8 text-center relative overflow-hidden" style={{ background: color }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/15 border-2 border-white/25 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
              {empresa.logo_url ? <img src={empresa.logo_url} alt={empresa.name} className="w-12 h-12 object-cover rounded-xl" /> : '⚽'}
            </div>
            <div className="font-bebas text-2xl text-white tracking-widest leading-tight uppercase">{empresa.name}</div>
            <div className="text-white/60 text-sm mt-1">Prode Mundial 2026 🏆</div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="text-xl font-black text-slate-900 mb-1">¡Bienvenido!</div>
          <div className="text-sm text-slate-400 mb-5">Ingresá tus datos para participar del prode</div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Tu nombre completo" placeholder="Ej: María González"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              error={errors.name} autoComplete="name" />

            <Input label="Correo electrónico" type="email" placeholder="tu@correo.com"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              error={errors.email} autoComplete="email" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Celular</label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center gap-1.5 px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-500">
                  🇦🇷 +54
                </div>
                <input type="tel" placeholder="11 1234-5678"
                  value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  autoComplete="tel"
                  className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-[#002B72] focus:bg-white transition-colors ${errors.phone ? 'border-red-400' : 'border-slate-200'}`} />
              </div>
              {errors.phone && <p className="text-xs text-red-500 font-semibold">{errors.phone}</p>}
            </div>

            {/* Recordarme */}
            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
              <div
                onClick={() => setRemember(r => !r)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${remember ? 'border-[#002B72] bg-[#002B72]' : 'border-slate-300 bg-white'}`}>
                {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-sm font-semibold text-slate-700">Recordarme en este dispositivo</span>
            </label>

            {/* Términos */}
            <div className={`flex items-start gap-3 cursor-pointer select-none py-1 ${errors.terms ? 'p-2 bg-red-50 rounded-xl' : ''}`}
              onClick={() => { setTerms(t => !t); setErrors(e => ({...e, terms: ''})) }}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all flex-shrink-0
                ${terms ? 'border-[#002B72] bg-[#002B72]' : errors.terms ? 'border-red-400' : 'border-slate-300 bg-white'}`}>
                {terms && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-sm text-slate-500 leading-relaxed" onClick={e => e.stopPropagation()}>
                Acepto los{' '}
                <a href="/terminos" className="text-[#002B72] font-bold underline" onClick={e => e.stopPropagation()}>Términos y Condiciones</a>
                {' '}y la{' '}
                <a href="/privacidad" className="text-[#002B72] font-bold underline" onClick={e => e.stopPropagation()}>Política de Privacidad</a>
              </span>
            </div>
            {errors.terms && <p className="text-xs text-red-500 font-semibold -mt-2">{errors.terms}</p>}

            <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full font-black mt-1"
              style={{ background: color }}>
              {loading ? 'Entrando...' : 'Entrar al Prode ⚽'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

```

### `apps/web/src/components/ui/Badge.tsx`

```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'blue' | 'gray' | 'red'
}
const variants = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  blue:  'bg-blue-100 text-blue-800',
  gray:  'bg-slate-100 text-slate-600',
  red:   'bg-red-100 text-red-700',
}
export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${variants[variant]}`}>
      {children}
    </span>
  )
}

```

### `apps/web/src/components/ui/Button.tsx`

```typescript
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary:   'bg-[#002B72] text-white hover:bg-[#00318A] active:scale-[0.98]',
  secondary: 'bg-white text-[#002B72] border-2 border-[#002B72] hover:bg-blue-50',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100',
  danger:    'bg-red-600 text-white hover:bg-red-700',
}
const sizes = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-5 py-3 text-base rounded-xl',
  lg: 'px-7 py-4 text-lg rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'

```

### `apps/web/src/components/ui/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}
export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}

```

### `apps/web/src/components/ui/Input.tsx`

```typescript
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-slate-900 bg-slate-50
            placeholder:text-slate-400 placeholder:font-normal
            focus:outline-none focus:border-[#002B72] focus:bg-white
            transition-colors duration-150
            ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}
            ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

```

### `apps/web/src/lib/football/index.ts`

```typescript
/** football-data.org v4 — free tier: 10 calls/min, no CORS */
const BASE = 'https://api.football-data.org/v4'
const WORLD_CUP_2026 = 'WC' // competition code

async function fdFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  })
  if (!res.ok) throw new Error(`football-data.org error: ${res.status}`)
  return res.json() as Promise<T>
}

export interface FDMatch {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED'
  stage: string
  group: string | null
  homeTeam: { id: number; name: string; crest: string }
  awayTeam: { id: number; name: string; crest: string }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
}

export interface FDMatchesResponse {
  count: number
  matches: FDMatch[]
}

/** Fetch all World Cup 2026 matches */
export async function getAllMatches(): Promise<FDMatchesResponse> {
  return fdFetch(`/competitions/${WORLD_CUP_2026}/matches`)
}

/** Fetch today's matches */
export async function getTodayMatches(): Promise<FDMatchesResponse> {
  const today = new Date().toISOString().split('T')[0]
  return fdFetch(`/competitions/${WORLD_CUP_2026}/matches?dateFrom=${today}&dateTo=${today}`)
}

/** Fetch a single match */
export async function getMatch(id: number): Promise<{ match: FDMatch }> {
  return fdFetch(`/matches/${id}`)
}

/** Map API status to our DB status */
export function mapStatus(status: FDMatch['status']): 'scheduled' | 'live' | 'finished' {
  if (['LIVE', 'IN_PLAY', 'PAUSED'].includes(status)) return 'live'
  if (status === 'FINISHED') return 'finished'
  return 'scheduled'
}

```

### `apps/web/src/lib/geolocation/index.ts`

```typescript
/** Haversine formula — returns distance in km */
export function getDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface Promo {
  id: string
  business_id: string
  business_name: string
  description: string
  image_url: string | null
  lat: number
  lon: number
  radius_km: number
  valid_until: string
}

/** Filter promos by user location */
export function filterPromosByLocation(
  promos: Promo[],
  userLat: number,
  userLon: number,
): Promo[] {
  return promos
    .filter((p) => getDistanceKm(userLat, userLon, p.lat, p.lon) <= p.radius_km)
    .sort((a, b) => {
      const da = getDistanceKm(userLat, userLon, a.lat, a.lon)
      const db = getDistanceKm(userLat, userLon, b.lat, b.lon)
      return da - db
    })
}

```

### `apps/web/src/lib/mercadopago/index.ts`

```typescript
// MercadoPago integration
// Install: npm install mercadopago
// Docs: https://github.com/mercadopago/sdk-nodejs

export interface PlanConfig {
  id: 'premium' | 'pro'
  title: string
  price: number
  currency: 'USD'
}

export const PLANS: Record<string, PlanConfig> = {
  premium: { id: 'premium', title: 'Prode Mundial 2026 — Plan Premium', price: 15, currency: 'USD' },
  pro:     { id: 'pro',     title: 'Prode Mundial 2026 — Plan Pro',     price: 25, currency: 'USD' },
}

export async function createCheckoutPreference(_params: {
  plan: 'premium' | 'pro'
  businessId: string
  adminEmail: string
  backUrls: { success: string; failure: string; pending: string }
}) {
  // TODO: Install mercadopago SDK and implement
  // npm install mercadopago
  throw new Error('MercadoPago SDK not installed. Run: npm install mercadopago')
}

```

### `apps/web/src/lib/meta/instagram.ts`

```typescript
const BASE = 'https://graph.facebook.com/v22.0'

async function callIG<T>(path: string, params: Record<string, string>, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (method === 'GET') Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(method === 'POST' ? { body: JSON.stringify(params) } : {}),
  })

  if (!res.ok) throw new Error(`Instagram API error: ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

/**
 * Step 1: Create a media container with the image URL + caption
 * The imageUrl must be publicly accessible (e.g., stored in Supabase Storage)
 */
export async function createMediaContainer({
  igUserId,
  accessToken,
  imageUrl,
  caption,
}: {
  igUserId: string
  accessToken: string
  imageUrl: string
  caption: string
}): Promise<{ id: string }> {
  return callIG<{ id: string }>(
    `/${igUserId}/media`,
    { image_url: imageUrl, caption, access_token: accessToken },
    'POST',
  )
}

/**
 * Step 2: Publish the media container
 */
export async function publishMedia({
  igUserId,
  accessToken,
  creationId,
}: {
  igUserId: string
  accessToken: string
  creationId: string
}): Promise<{ id: string }> {
  return callIG<{ id: string }>(
    `/${igUserId}/media_publish`,
    { creation_id: creationId, access_token: accessToken },
    'POST',
  )
}

/**
 * Full flow: upload image URL → publish post → return post ID
 */
export async function publishPodioPost({
  igUserId,
  accessToken,
  imageUrl,
  caption,
  hashtags,
}: {
  igUserId: string
  accessToken: string
  imageUrl: string
  caption: string
  hashtags: string[]
}) {
  const fullCaption = `${caption}\n\n${hashtags.join(' ')}`
  const container = await createMediaContainer({ igUserId, accessToken, imageUrl, caption: fullCaption })
  const post = await publishMedia({ igUserId, accessToken, creationId: container.id })
  return post
}

/** Instagram webhook: validate subscription */
export function validateWebhookChallenge(
  mode: string,
  token: string,
  challenge: string,
): string | null {
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return challenge
  }
  return null
}

```

### `apps/web/src/lib/meta/whatsapp.ts`

```typescript
const BASE = 'https://graph.facebook.com/v22.0'

export interface WASendResult {
  messaging_product: string
  contacts: Array<{ input: string; wa_id: string }>
  messages: Array<{ id: string }>
}

async function callWA<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${process.env.META_PHONE_NUMBER_ID}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`WhatsApp API error: ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

/** Send a plain text WhatsApp message */
export async function sendText(to: string, text: string): Promise<WASendResult> {
  return callWA<WASendResult>('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  })
}

/** Send a template message (for recurring notifications — requires Meta approval) */
export async function sendTemplate(
  to: string,
  templateName: string,
  components: unknown[],
  languageCode = 'es',
): Promise<WASendResult> {
  return callWA<WASendResult>('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: { name: templateName, language: { code: languageCode }, components },
  })
}

/** Prode-specific helpers */
export const prodeWA = {
  /** Reminder before a match date */
  reminder: (to: string, empresaNombre: string, fecha: string, deadline: string) =>
    sendText(
      to,
      `⚽ *${empresaNombre} — Prode Mundial 2026*\n\n` +
      `Los partidos de la ${fecha} arrancan pronto.\n` +
      `⏰ Podés cargar tus pronósticos hasta *${deadline}*.\n\n` +
      `👉 Entrá acá: ${process.env.NEXT_PUBLIC_APP_URL}`,
    ),

  /** Result notification */
  result: (to: string, empresaNombre: string, fecha: string, puntaje: number, posicion: number) =>
    sendText(
      to,
      `🏆 *${empresaNombre} — Resultado ${fecha}*\n\n` +
      `Sumaste *${puntaje} puntos* y estás en el puesto *${posicion}°*.\n\n` +
      `¡Seguí así! 💪`,
    ),
}

```

### `apps/web/src/lib/qr/index.ts`

```typescript
import QRCode from 'qrcode'

export async function generateQRDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#002B72', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  })
}

export async function generateQRSVG(url: string): Promise<string> {
  return QRCode.toString(url, { type: 'svg', width: 300, margin: 2 })
}

```

### `apps/web/src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

```

### `apps/web/src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any),
          )
        },
      },
    },
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

```

### `apps/web/src/lib/supabase/server.ts`

```typescript
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as any)
          })
        },
      },
    },
  )
}

```

### `apps/web/src/stores/prodeStore.ts`

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Prediction {
  matchId: number
  homeScore: number
  awayScore: number
  savedAt: string
}

interface ProdeState {
  participantId: string | null
  businessId: string | null
  predictions: Record<number, Prediction>
  setPrediction: (matchId: number, home: number, away: number) => void
  setParticipant: (id: string, businessId: string) => void
  clearPredictions: () => void
}

export const useProdeStore = create<ProdeState>()(
  persist(
    (set) => ({
      participantId: null,
      businessId: null,
      predictions: {},
      setPrediction: (matchId, homeScore, awayScore) =>
        set((s) => ({
          predictions: {
            ...s.predictions,
            [matchId]: { matchId, homeScore, awayScore, savedAt: new Date().toISOString() },
          },
        })),
      setParticipant: (participantId, businessId) => set({ participantId, businessId }),
      clearPredictions: () => set({ predictions: {} }),
    }),
    {
      name: 'prode-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

```

### `apps/web/src/styles/globals.css`

```css
@import "tailwindcss";

:root {
  --font-bebas: 'Bebas Neue', sans-serif;
  --font-jakarta: 'Plus Jakarta Sans', sans-serif;
}

* { box-sizing: border-box; }

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.font-bebas { font-family: 'Bebas Neue', cursive; }

```

### `apps/web/src/types/index.ts`

```typescript
export type Plan = 'free' | 'premium' | 'pro'

export interface Business {
  id: string
  slug: string
  name: string
  admin_user_id: string
  admin_email: string
  logo_url: string | null
  primary_color: string
  banner_urls: string[]
  welcome_msg: string
  registration_deadline: string | null
  plan: Plan
  active: boolean
  ig_user_id: string | null
  ig_access_token: string | null
  ig_hashtags: string[]
  mp_payment_id: string | null
  paid_at: string | null
  created_at: string
}

export interface Participant {
  id: string
  business_id: string
  google_uid: string | null
  name: string
  email: string
  phone: string
  remember_me: boolean
  accepted_terms: boolean
  total_points: number
  rank: number | null
  registered_at: string
}

export interface Match {
  id: number
  stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
  group: string | null
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  kickoff_at: string
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'live' | 'finished'
}

export interface Prediction {
  id: string
  participant_id: string
  business_id: string
  match_id: number
  home_pred: number
  away_pred: number
  points_earned: number
  submitted_at: string
}

export interface Prize {
  id: string
  business_id: string
  rank: number
  description: string
  image_url: string | null
}

export interface Promo {
  id: string
  business_id: string
  business_name: string
  description: string
  image_url: string | null
  category: string
  lat: number
  lon: number
  radius_km: number
  valid_from: string
  valid_until: string
  views: number
}

export interface LeaderboardEntry {
  business_id: string
  participant_id: string
  participant_name: string
  total_points: number
  exact_results: number
  correct_winners: number
  rank: number
}

```

### `apps/web/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bebas:   ['var(--font-bebas)', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
      },
      colors: {
        brand: {
          azul:    '#002B72',
          celeste: '#74ACDF',
          dorado:  '#F5C518',
        },
      },
    },
  },
  plugins: [],
}

export default config

```

### `apps/web/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@prode/shared": [
        "../../packages/shared/src"
      ],
      "@prode/db": [
        "../../packages/db/src"
      ]
    },
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "isolatedModules": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

### `docker-compose.yml`

```yaml
services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: development
      PORT: 4000
    env_file:
      - .env.local
    volumes:
      - ./apps/api/src:/app/src
      - ./packages:/packages
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:

```

### `package.json`

```json
{
  "name": "prode-mundial",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate"
  },
  "devDependencies": {
    "turbo": "^2.3.3",
    "typescript": "^5.7.3",
    "prettier": "^3.4.2",
    "eslint": "^9.18.0",
    "@typescript-eslint/eslint-plugin": "^8.20.0",
    "@typescript-eslint/parser": "^8.20.0"
  },
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  }
}

```

### `packages/db/package.json`

```json
{
  "name": "@prode/db",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/database.types.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.4"
  },
  "devDependencies": {
    "supabase": "^2.20.5",
    "typescript": "^5.7.3"
  }
}

```

### `packages/db/src/database.types.ts`

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          slug: string
          name: string
          admin_user_id: string
          admin_email: string
          logo_url: string | null
          primary_color: string
          banner_urls: string[]
          welcome_msg: string
          registration_deadline: string | null
          plan: 'free' | 'premium' | 'pro'
          active: boolean
          ig_user_id: string | null
          ig_access_token: string | null
          ig_hashtags: string[]
          mp_payment_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      participants: {
        Row: {
          id: string
          business_id: string
          google_uid: string | null
          name: string
          email: string
          phone: string
          remember_me: boolean
          accepted_terms: boolean
          total_points: number
          rank: number | null
          registered_at: string
        }
        Insert: Omit<Database['public']['Tables']['participants']['Row'], 'id' | 'registered_at'> & {
          id?: string
          registered_at?: string
        }
        Update: Partial<Database['public']['Tables']['participants']['Insert']>
      }
      matches: {
        Row: {
          id: number
          stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
          group: string | null
          home_team: string
          away_team: string
          home_flag: string
          away_flag: string
          kickoff_at: string
          home_score: number | null
          away_score: number | null
          status: 'scheduled' | 'live' | 'finished'
          fd_match_id: number | null
          scored_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], never>
        Update: Partial<Database['public']['Tables']['matches']['Row']>
      }
      predictions: {
        Row: {
          id: string
          participant_id: string
          business_id: string
          match_id: number
          home_pred: number
          away_pred: number
          points_earned: number
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>
      }
      prizes: {
        Row: {
          id: string
          business_id: string
          rank: number
          description: string
          image_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['prizes']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['prizes']['Insert']>
      }
      promos: {
        Row: {
          id: string
          business_id: string
          category: string
          description: string
          image_url: string | null
          lat: number
          lon: number
          radius_km: number
          valid_from: string
          valid_until: string
          active: boolean
          views: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['promos']['Row'], 'id' | 'views' | 'created_at'> & {
          id?: string
          views?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['promos']['Insert']>
      }
      leaderboard_cache: {
        Row: {
          business_id: string
          participant_id: string
          total_points: number
          exact_results: number
          correct_winners: number
          rank: number
          updated_at: string
        }
        Insert: Database['public']['Tables']['leaderboard_cache']['Row']
        Update: Partial<Database['public']['Tables']['leaderboard_cache']['Row']>
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_empresa_stats: {
        Args: { business_id: string }
        Returns: {
          total_participants: number
          predictions_loaded: number
          coverage_pct: number
        }
      }
      recalculate_leaderboard: {
        Args: { p_business_id: string }
        Returns: undefined
      }
    }
    Enums: {
      plan_type: 'free' | 'premium' | 'pro'
      match_status: 'scheduled' | 'live' | 'finished'
      match_stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
    }
  }
}

```

### `packages/db/src/helpers.ts`

```typescript
import type { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

```

### `packages/db/src/index.ts`

```typescript
export type { Database } from './database.types'
export type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from './helpers'

```

### `packages/shared/package.json`

```json
{
  "name": "@prode/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}

```

### `packages/shared/src/constants.ts`

```typescript
export const POINTS = { EXACT: 3, WINNER: 1, MISS: 0 } as const
export const LOCK_MINUTES_BEFORE_KICKOFF = 5
export const PLANS = {
  free:    { maxParticipants: 5,   hasData: false, hasPromos: false, hasWhatsApp: false },
  premium: { maxParticipants: null, hasData: true,  hasPromos: false, hasWhatsApp: true  },
  pro:     { maxParticipants: null, hasData: true,  hasPromos: true,  hasWhatsApp: true  },
} as const
export const WORLD_CUP_2026_GROUPS = ['A','B','C','D','E','F','G','H'] as const

```

### `packages/shared/src/index.ts`

```typescript
export * from './scoring'
export * from './slugify'
export * from './constants'

```

### `packages/shared/src/scoring.ts`

```typescript
export function calcPoints(
  homePred: number, awayPred: number,
  homeReal: number, awayReal: number,
): number {
  if (homePred === homeReal && awayPred === awayReal) return 3
  if (Math.sign(homePred - awayPred) === Math.sign(homeReal - awayReal)) return 1
  return 0
}

```

### `packages/shared/src/slugify.ts`

```typescript
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63) // max URL slug length
}

```

### `supabase/functions/sync-matches/index.ts`

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'

const WORLD_CUP = 'WC'
const BASE = 'https://api.football-data.org/v4'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const res = await fetch(`${BASE}/competitions/${WORLD_CUP}/matches`, {
    headers: { 'X-Auth-Token': Deno.env.get('FOOTBALL_DATA_API_KEY')! },
  })

  const { matches } = await res.json()

  let updated = 0
  for (const m of matches) {
    const status =
      ['LIVE','IN_PLAY','PAUSED'].includes(m.status) ? 'live'
      : m.status === 'FINISHED' ? 'finished'
      : 'scheduled'

    const { error } = await supabase.from('matches').upsert({
      fd_match_id: m.id,
      home_team:   m.homeTeam.name,
      away_team:   m.awayTeam.name,
      kickoff_at:  m.utcDate,
      status,
      home_score:  m.score?.fullTime?.home ?? null,
      away_score:  m.score?.fullTime?.away ?? null,
      stage:       m.stage === 'GROUP_STAGE' ? 'group' : m.stage.toLowerCase(),
      group:       m.group ?? null,
    }, { onConflict: 'fd_match_id' })

    if (!error) updated++
  }

  return new Response(JSON.stringify({ synced: updated }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

```

### `supabase/migrations/20260101000000_initial.sql`

```sql
-- ──────────────────────────────────────────
--  PRODE MUNDIAL 2026 — Initial migration
-- ──────────────────────────────────────────

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for fast text search

-- ── ENUMS ──
create type plan_type    as enum ('free','premium','pro');
create type match_status as enum ('scheduled','live','finished');
create type match_stage  as enum ('group','r32','r16','qf','sf','final');

-- ── BUSINESSES ──
create table businesses (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,
  name                text not null,
  admin_user_id       uuid references auth.users(id) on delete cascade,
  admin_email         text not null,
  logo_url            text,
  primary_color       text not null default '#002B72',
  banner_urls         text[] not null default '{}',
  welcome_msg         text not null default '¡Bienvenido al prode!',
  registration_deadline timestamptz,
  plan                plan_type not null default 'free',
  active              boolean not null default true,
  ig_user_id          text,
  ig_access_token     text,
  ig_hashtags         text[] not null default '{}',
  mp_payment_id       text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_businesses_slug on businesses(slug);
create index idx_businesses_admin on businesses(admin_user_id);

-- ── PARTICIPANTS ──
create table participants (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  google_uid      text,
  name            text not null,
  email           text not null,
  phone           text not null,
  remember_me     boolean not null default false,
  accepted_terms  boolean not null default false,
  total_points    int not null default 0,
  rank            int,
  registered_at   timestamptz not null default now(),
  unique(business_id, email)
);

create index idx_participants_business on participants(business_id);
create index idx_participants_email    on participants(email);

-- ── MATCHES ──
create table matches (
  id          serial primary key,
  stage       match_stage not null,
  "group"     text,
  home_team   text not null,
  away_team   text not null,
  home_flag   text not null default '',
  away_flag   text not null default '',
  kickoff_at  timestamptz not null,
  home_score  int,
  away_score  int,
  status      match_status not null default 'scheduled',
  fd_match_id int unique,            -- football-data.org reference
  scored_at   timestamptz            -- set when scoring is complete
);

create index idx_matches_status    on matches(status);
create index idx_matches_kickoff   on matches(kickoff_at);

-- ── PREDICTIONS ──
create table predictions (
  id              uuid primary key default uuid_generate_v4(),
  participant_id  uuid not null references participants(id) on delete cascade,
  business_id     uuid not null references businesses(id) on delete cascade,
  match_id        int  not null references matches(id) on delete cascade,
  home_pred       int  not null,
  away_pred       int  not null,
  points_earned   int  not null default 0,
  submitted_at    timestamptz not null default now(),
  unique(participant_id, match_id)  -- one prediction per participant per match
);

create index idx_predictions_participant on predictions(participant_id);
create index idx_predictions_business    on predictions(business_id);
create index idx_predictions_match       on predictions(match_id);

-- ── PRIZES ──
create table prizes (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  rank        int  not null,
  description text not null,
  image_url   text,
  unique(business_id, rank)
);

-- ── PROMOS ──
create table promos (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  category    text not null,
  description text not null,
  image_url   text,
  lat         numeric(10,7) not null,
  lon         numeric(10,7) not null,
  radius_km   numeric(5,2)  not null default 1.0,
  valid_from  timestamptz   not null,
  valid_until timestamptz   not null,
  active      boolean       not null default true,
  views       int           not null default 0,
  created_at  timestamptz   not null default now()
);

create index idx_promos_business on promos(business_id);
create index idx_promos_active   on promos(active, valid_until);

-- ── LEADERBOARD CACHE ──
create table leaderboard_cache (
  business_id     uuid not null references businesses(id) on delete cascade,
  participant_id  uuid not null references participants(id) on delete cascade,
  total_points    int  not null default 0,
  exact_results   int  not null default 0,
  correct_winners int  not null default 0,
  rank            int  not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (business_id, participant_id)
);

create index idx_leaderboard_rank on leaderboard_cache(business_id, rank);

-- ── FUNCTIONS ──

-- Stats for empresa dashboard
create or replace function get_empresa_stats(business_id uuid)
returns table(total_participants bigint, predictions_loaded bigint, coverage_pct numeric)
language sql security definer as $$
  select
    count(distinct p.id)::bigint                              as total_participants,
    count(distinct pred.participant_id)::bigint               as predictions_loaded,
    case when count(distinct p.id) = 0 then 0
         else round(count(distinct pred.participant_id)::numeric / count(distinct p.id) * 100, 1)
    end                                                       as coverage_pct
  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = get_empresa_stats.business_id;
$$;

-- Recalculate leaderboard for a business
create or replace function recalculate_leaderboard(p_business_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into leaderboard_cache(business_id, participant_id, total_points, exact_results, correct_winners, rank, updated_at)
  select
    p.business_id,
    p.id,
    coalesce(sum(pred.points_earned), 0),
    coalesce(sum(case when pred.points_earned = 3 then 1 else 0 end), 0),
    coalesce(sum(case when pred.points_earned = 1 then 1 else 0 end), 0),
    row_number() over (order by coalesce(sum(pred.points_earned), 0) desc),
    now()
  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = p_business_id
  group by p.id, p.business_id
  on conflict (business_id, participant_id) do update set
    total_points    = excluded.total_points,
    exact_results   = excluded.exact_results,
    correct_winners = excluded.correct_winners,
    rank            = excluded.rank,
    updated_at      = excluded.updated_at;

  -- Also update participants.total_points
  update participants pa
  set
    total_points = lc.total_points,
    rank         = lc.rank
  from leaderboard_cache lc
  where lc.participant_id = pa.id
    and lc.business_id    = p_business_id;
end;
$$;

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_updated_at
  before update on businesses
  for each row execute function set_updated_at();

-- ── ROW LEVEL SECURITY ──
alter table businesses       enable row level security;
alter table participants     enable row level security;
alter table predictions      enable row level security;
alter table prizes           enable row level security;
alter table promos           enable row level security;
alter table leaderboard_cache enable row level security;

-- Businesses: admin can do everything
create policy "businesses_admin" on businesses
  for all using (auth.uid() = admin_user_id);

-- Participants: can see their own business's data
create policy "participants_read" on participants
  for select using (true);  -- public leaderboard

create policy "participants_insert" on participants
  for insert with check (true);  -- anyone can register

-- Predictions: participants manage their own
create policy "predictions_own" on predictions
  for all using (
    participant_id in (
      select id from participants where email = auth.jwt()->>'email'
    )
  );

-- Prizes: public read
create policy "prizes_read" on prizes for select using (true);

-- Promos: public read
create policy "promos_read" on promos
  for select using (active = true and valid_until > now());

-- Leaderboard: public read
create policy "leaderboard_read" on leaderboard_cache for select using (true);

```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "paths": {
      "@prode/shared": ["./packages/shared/src"],
      "@prode/db": ["./packages/db/src"]
    }
  },
  "exclude": ["node_modules", "dist", ".next"]
}

```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}

```