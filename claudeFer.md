# claudeFer.md — Contexto del proyecto elprode.ar

## Forma de trabajo
- Fernando diseña y piensa, yo armo los prompts para Claude Code
- Claude Code ejecuta los cambios en el repo local
- Siempre trabajamos en ramas separadas y mergeamos a main cuando está listo
- El repo está en `/Users/fernandocorrea/Documents/prode-argento`
- Para revisar código uso `cat` sobre los archivos del repo clonado
- Puedo ver la app en producción con Claude in Chrome (ya conectado)

---

## El producto

**elprode.ar** — Plataforma de prode del Mundial 2026 para comercios.

**Concepto central:** El prode es una excusa para que comercios retengan y contacten clientes. No es solo un juego — es una herramienta de marketing y fidelización.

**Dos tipos de usuarios:**
1. **Comercios** — crean su propio prode con su marca, configuran premios, notifican clientes
2. **Participantes/Clientes** — juegan en el prode del comercio, pronostican partidos

---

## Stack técnico

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS — deployado en Vercel
- **Backend:** NestJS (Fastify) — deployado en Render
- **DB:** Supabase (PostgreSQL)
- **Storage:** Cloudflare R2 (`pub-8d11c5d41eec425da2be41e6d221730e.r2.dev`)
- **Pagos:** MercadoPago Checkout Pro
- **Email:** Resend (`onboarding@resend.dev` → `elprodeargento@gmail.com`)
- **Analytics:** Google Analytics GA4 (`G-EDEPKXWE2M`)
- **Monorepo:** Turborepo con `apps/web`, `apps/api`, `packages/`

---

## URLs importantes
- Producción: `https://elprode.ar`
- Panel comercio: `https://elprode.ar/empresa/dashboard`
- Prode de un comercio: `https://{slug}.elprode.ar`
- Link referido comercio: `https://ref.elprode.ar/{slug}`
- Link referido jugador: `https://elprode.ar/ref/jugador/{code}`
- API: `https://prode-argento.onrender.com/api/v1`

---

## Planes y precios

| Plan | Precio | Características |
|------|--------|----------------|
| Free | $0 | Hasta 5 participantes, todo el mundial |
| Pro | $40.000 + IVA (cobra $48.400) | Participantes ilimitados, push, QR, exportar lista |
| Premium | $80.000 + IVA (cobra $96.800) | Todo Pro + banner geo 5km, estadísticas, soporte WA |

---

## Estructura de la DB (tablas principales)

- `businesses` — comercios (slug único, plan, logo_url, primary_color, referral_points, player_referral_code)
- `participants` — jugadores (business_id, email, name, phone, total_points, rank, registered_at)
- `matches` — partidos (home_team, away_team, kickoff_at, status, home_score, away_score)
- `predictions` — pronósticos (participant_id, match_id, home_pred, away_pred, points_earned)
- `prizes` — premios del mundial (business_id, rank, description)
- `weekly_prizes` — premios semanales (business_id, week_index, rank, description)
- `referrals` — referidos de comercios (referrer_id, referred_id, status, points_awarded)
- `player_referrers` — jugadores que refieren comercios (email, referral_code, total_referrals, pending_amount)
- `leaderboard_cache` — cache del ranking

**RPC importante:** `get_empresa_stats(business_id)` — devuelve total_participants, predictions_loaded, coverage_pct, new_today, weekly_visits

---

## Sistema de referidos (DOS sistemas)

### 1. Referidos de comercios
- Link: `ref.elprode.ar/{slug}`
- Cada comercio referido que paga = 10 puntos
- Tabla de canjes: 10pts=insignia, 30pts=$12.000, 50pts=Pro gratis, 100pts=Premium gratis
- Páginas: `/empresa/referidos` y `/empresa/canjes`

### 2. Referidos de jugadores
- Link: `elprode.ar/ref/jugador/{code}`
- Cada 3 comercios que pagan = $12.000 para el jugador
- Tab "Referidos" en el prode del cliente con barra de progreso
- Cuando completa grupo de 3 → email automático a elprodeargento@gmail.com
- Solicitud de cobro manual (transferencia bancaria o MP)

---

## Panel del comercio — páginas principales

- `/empresa/dashboard` — inicio con checklist, métricas, próximo partido, premio semanal, consejos
- `/empresa/participantes` — lista con exportar CSV y notificar a todos
- `/empresa/ranking` — tabs Mundial/Semanal
- `/empresa/partidos` — listado de partidos
- `/empresa/configuracion` — logo, colores, imagen de fondo
- `/empresa/premios` — premios del mundial + premios semanales por semana
- `/empresa/notificaciones` — push (default) y WhatsApp (próximamente)
- `/empresa/planes` — Free/Pro/Premium con pago único
- `/empresa/referidos` — link + historial + puntos acumulados
- `/empresa/canjes` — tienda de premios con puntos

---

## Prode del cliente — tabs

- **Home** — puntos, posición, countdown, próximo partido, premio semanal, ranking semanal, compartir
- **Pronosticar** — lista de partidos con inputs, botón flotante para guardar
- **Ranking** — general del mundial con compartir imagen Canvas
- **Resultados** — partidos jugados con puntos ganados
- **Referidos** — barra de progreso, link de referido, solicitud de cobro
- **Perfil** — accesible desde avatar en header (no en nav inferior)

---

## Features importantes implementadas

### Dashboard del comercio
- Checklist de primeros pasos (logo, premio, participantes, mensaje, referido)
- Badge de puntos de referidos en sidebar
- Slider de consejos de negocio (20 segundos por slide)
- Upgrade banner para plan Free
- Premio semanal con botón notificar ganador
- Próximo partido conectado a API real con contador de sin pronósticos

### Prode del cliente
- Countdown al mundial (11 jun 2026)
- Compartir posición como imagen generada con Canvas (logo via proxy API)
- Premio semanal visible con nombre del comercio
- Ranking semanal
- Botón "Invitá a un amigo" con share nativo
- Celebración cuando acertás resultado exacto
- Banner en Home recordando ganar $12.000 con referidos

### Viralización
- Compartir podio en Instagram (IgPublishModal)
- Compartir por WhatsApp (WhatsAppSendModal) — safe area en mobile
- QR descargable (lib/qr/card.ts) — mismo proxy para logo
- Referidos de comercios y jugadores

---

## Variables de entorno importantes

### Vercel (frontend)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GA_ID=G-EDEPKXWE2M`
- `RESEND_API_KEY`

### Render (backend)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `RESEND_API_KEY`
- `FOOTBALL_DATA_API_KEY`

---

## Crons configurados

- **Sync de partidos:** 10:00 UTC y 02:00 UTC (ampliar a cada hora durante el mundial)
- **Scoring de predicciones:** cada 5 minutos (notifications.scheduler.ts)

---

## Pendientes / Backlog

- [ ] Ampliar sync de partidos a cada hora durante el mundial
- [ ] Descuento de lanzamiento — primeros 50 comercios Pro a precio especial
- [ ] Verificar dominio `elprode.ar` en Resend para no caer en spam
- [ ] Panel de administración para ver todos los comercios
- [ ] WhatsApp e Instagram notificaciones (esperando config API de Meta)
- [ ] Exportar lista de participantes (prometido en planes Pro/Premium)
- [ ] Promos geo para plan Premium (carrusel de negocios por GPS)

---

## Ale (el otro dev)

Ale trabaja en paralelo principalmente en:
- Notificaciones (backend de WhatsApp e Instagram)
- Infraestructura y configuración
- Fixes de backend

Coordinación: trabajamos en ramas separadas, Fernando hace merge a main cuando está listo.

---

## Notas técnicas importantes

- **CORS en R2:** Las imágenes del logo usan proxy endpoint `/storage/proxy?url=...` para evitar CORS en Canvas
- **Subdominios:** El middleware de Next.js maneja `{slug}.elprode.ar` → `/p/[slug]` y `ref.elprode.ar/{slug}` → `/ref/[slug]`
- **Fastify:** El backend usa Fastify (no Express) — usar `res.header()` y `res.code()` en lugar de `res.set()` y `res.status()`
- **IVA:** Los precios en PLANS del backend incluyen IVA (48.400 y 96.800), el frontend muestra los precios sin IVA con leyenda "No incluye IVA"
- **Semanas del mundial:** Se calculan desde el 11/06/2026, índice 0-based
- **SOCIAL_ENABLED:** Flag que controla si WhatsApp e Instagram están activos (actualmente false)
