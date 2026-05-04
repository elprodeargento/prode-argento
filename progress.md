# 🏆 Prode Mundial 2026 — Board de Progreso

> Actualizado: Mayo 2026 · Estado general: **38% completado**

---

## ⚠️ Situación real de la API

El `app.module.ts` importa **11 módulos**, pero solo **3 tienen código**.
Los otros 8 son directorios vacíos — **el NestJS no arranca hasta resolverlos**.

| Módulo | Archivos | Estado |
|--------|----------|--------|
| `PredictionsModule` | controller + service + dto | ✅ Implementado |
| `LeaderboardModule` | controller + service | ✅ Implementado |
| `NotificationsModule` | service + scheduler | ✅ Implementado |
| `AuthModule` | — | ❌ Directorio vacío |
| `BusinessesModule` | — | ❌ Directorio vacío |
| `ParticipantsModule` | — | ❌ Directorio vacío |
| `MatchesModule` | — | ❌ Directorio vacío |
| `PrizesModule` | — | ❌ Directorio vacío |
| `PromosModule` | — | ❌ Directorio vacío |
| `InstagramModule` | — | ❌ Directorio vacío |
| `PaymentsModule` | — | ❌ Directorio vacío |

---

## 📊 Resumen por área

| Área | Hecho | Total | % |
|------|-------|-------|---|
| Frontend — Estructura & UI | 8 | 8 | 100% |
| Frontend — Landing | 4 | 4 | 100% |
| Frontend — Auth empresa | 2 | 2 | 100% |
| Frontend — Panel empresa | 1 | 8 | 12% |
| Frontend — Vista participante | 2 | 4 | 50% |
| Backend — Infraestructura base | 2 | 5 | 40% |
| Backend — Módulos con código | 3 | 11 | 27% |
| Base de datos + migraciones | 3 | 3 | 100% |
| Integraciones externas | 0 | 5 | 0% |
| Deploy | 0 | 3 | 0% |

---

## 👤 Dev 1 — Backend & Infra

### 🔴 Urgente — API no levanta sin esto

- [ ] ⬜ **AuthModule** — módulo mínimo para que NestJS arranque + guard de Supabase
  - `apps/api/src/modules/auth/auth.module.ts`
  - `apps/api/src/modules/auth/auth.controller.ts` — `GET /auth/me`

- [ ] ⬜ **BusinessesModule** — CRUD empresa: crear al registrar, editar config, get por slug, cambiar plan
  - `apps/api/src/modules/businesses/businesses.module.ts`
  - `apps/api/src/modules/businesses/businesses.controller.ts`
  - `apps/api/src/modules/businesses/businesses.service.ts`
  - `apps/api/src/modules/businesses/dto/create-business.dto.ts`
  - `apps/api/src/modules/businesses/dto/update-business.dto.ts`

- [ ] ⬜ **ParticipantsModule** — registro, validar límite de plan (Free ≤ 5), lista por empresa
  - `apps/api/src/modules/participants/participants.module.ts`
  - `apps/api/src/modules/participants/participants.controller.ts`
  - `apps/api/src/modules/participants/participants.service.ts`
  - `apps/api/src/modules/participants/dto/create-participant.dto.ts`

- [ ] ⬜ **MatchesModule** — GET partidos por fecha, actualizar resultados, trigger scoring
  - `apps/api/src/modules/matches/matches.module.ts`
  - `apps/api/src/modules/matches/matches.controller.ts`
  - `apps/api/src/modules/matches/matches.service.ts`

- [ ] ⬜ **PrizesModule** — CRUD premios por empresa, upsert masivo desde config
  - `apps/api/src/modules/prizes/prizes.module.ts`
  - `apps/api/src/modules/prizes/prizes.controller.ts`
  - `apps/api/src/modules/prizes/prizes.service.ts`
  - `apps/api/src/modules/prizes/dto/upsert-prizes.dto.ts`

- [ ] ⬜ **PromosModule** — CRUD promos, validar Plan Pro, GET por geolocalización, views++
  - `apps/api/src/modules/promos/promos.module.ts`
  - `apps/api/src/modules/promos/promos.controller.ts`
  - `apps/api/src/modules/promos/promos.service.ts`
  - `apps/api/src/modules/promos/dto/create-promo.dto.ts`

- [ ] ⬜ **InstagramModule** — OAuth Meta, publish-podio (imageUrl + caption), revocar
  - `apps/api/src/modules/instagram/instagram.module.ts`
  - `apps/api/src/modules/instagram/instagram.controller.ts`
  - `apps/api/src/modules/instagram/instagram.service.ts`
  - ⚠️ Depende de: cuenta Meta Business aprobada

- [ ] ⬜ **PaymentsModule** — crear preferencia MP, recibir webhook HMAC, activar plan en DB
  - `apps/api/src/modules/payments/payments.module.ts`
  - `apps/api/src/modules/payments/payments.controller.ts`
  - `apps/api/src/modules/payments/payments.service.ts`
  - Impacta: `apps/web/src/app/api/webhooks/mercadopago/route.ts`

### Infraestructura

- [ ] ⬜ **Cloudflare R2** — presigned URL para upload desde browser (logos, promos, podio)
  - `apps/web/src/lib/storage/r2.ts` ← nuevo
  - Instalar: `@aws-sdk/client-s3`
  - Exponer endpoint en NestJS para generar presigned URLs

- [ ] ⬜ **Supabase Auth Middleware activo** — proteger `/empresa/*`, refresh sesión SSR
  - `apps/web/middleware.ts` — activar lógica real (actualmente pass-through)

- [ ] ⬜ **Edge Function cron** — configurar schedule para `sync-matches` cada 5 min
  - `supabase/functions/sync-matches/index.ts` — código ya existe
  - Acción: Supabase Dashboard → Edge Functions → configurar cron

- [ ] ⬜ **Deploy Render** — NestJS en Docker, health check, env vars, auto-deploy
  - `apps/api/Dockerfile` — ya existe
  - Crear: `render.yaml`

- [ ] ⬜ **Deploy Vercel** — Next.js, env vars en producción, dominios
  - Crear: `vercel.json`
  - Configurar: `prode.ar` y `*.prode.ar` en Cloudflare DNS

---

## 👤 Dev 2 — Frontend & UX

### Panel empresa — Páginas stub a completar

- [ ] ⬜ **Configuración** — upload logo a R2, color, premios, fecha límite, welcome msg
  - `apps/web/src/app/(empresa)/empresa/configuracion/page.tsx` — actualmente stub
  - Crear: `apps/web/src/components/empresa/ConfigForm.tsx`
  - 🔗 Depende de: R2 presigned URL (Dev 1)

- [ ] ⬜ **Participantes** — tabla real con búsqueda, filtro, paginación, exportar CSV
  - `apps/web/src/app/(empresa)/empresa/participantes/page.tsx` — actualmente stub
  - Crear: `apps/web/src/components/empresa/ParticipantesTable.tsx`
  - 🔗 Depende de: ParticipantsModule (Dev 1)

- [ ] ⬜ **Ranking** — podio visual + tabla desde leaderboard_cache + botón publicar IG
  - `apps/web/src/app/(empresa)/empresa/ranking/page.tsx` — actualmente stub
  - Crear: `apps/web/src/components/empresa/RankingPodio.tsx`
  - Crear: `apps/web/src/components/instagram/IgPublishModal.tsx`
  - 🔗 Depende de: InstagramModule (Dev 1)

- [ ] ⬜ **Partidos** — listado por fecha, resultados reales, cobertura pronósticos, badge live
  - `apps/web/src/app/(empresa)/empresa/partidos/page.tsx` — actualmente stub
  - Crear: `apps/web/src/components/empresa/PartidosList.tsx`
  - 🔗 Depende de: MatchesModule (Dev 1)

- [ ] ⬜ **Premios** — lista editable, agregar/quitar puestos, imagen por premio
  - `apps/web/src/app/(empresa)/empresa/premios/page.tsx` — actualmente stub
  - Crear: `apps/web/src/components/empresa/PremiosList.tsx`
  - 🔗 Depende de: PrizesModule (Dev 1)

- [ ] ⬜ **Promos** — formulario + preview vivo, lista activas/vencidas, gate Plan Pro
  - `apps/web/src/app/(empresa)/empresa/promos/page.tsx` — actualmente stub
  - Crear: `apps/web/src/components/empresa/PromoForm.tsx`
  - 🔗 Depende de: PromosModule (Dev 1)

- [ ] ⬜ **Notificaciones** — selector destinatarios, mensaje, historial de envíos
  - `apps/web/src/app/(empresa)/empresa/notificaciones/page.tsx` — actualmente stub
  - Crear: `apps/web/src/components/empresa/NotifForm.tsx`
  - 🔗 NotificationsModule ya existe en Dev 1

### Flujos pendientes

- [ ] ⬜ **QR real descargable** — generar PNG con `qrcode`, conectar al slug real de Supabase
  - `apps/web/src/lib/qr/index.ts` — ya implementado, falta conectar al flujo
  - Crear: `apps/web/src/components/empresa/LinkGenerado.tsx`

- [ ] ⬜ **Flujo de pago MercadoPago** — instalar SDK, botones upgrade, Checkout Pro, retorno
  - `apps/web/src/lib/mercadopago/index.ts` — stub, instalar: `npm install mercadopago`
  - Crear: `apps/web/src/app/pago/[result]/page.tsx`
  - 🔗 Depende de: PaymentsModule (Dev 1)

- [ ] ⬜ **ProdeApp — datos reales** — reemplazar todos los mocks hardcodeados por Supabase
  - `apps/web/src/components/prode/ProdeApp.tsx` — datos mock actualmente
  - Conectar partidos, ranking, guardar predictions vía `POST /api/v1/predictions`

- [ ] ⬜ **Carrusel promos real con GPS** — pedir permiso, llamar endpoint, filtrar por radio
  - Crear: `apps/web/src/components/prode/PromoCarrusel.tsx`
  - `apps/web/src/lib/geolocation/index.ts` — ya implementado
  - 🔗 Depende de: PromosModule (Dev 1)

- [ ] ⬜ **Modal IG — publicar podio real** — html2canvas → R2 → API → feedback
  - Crear: `apps/web/src/components/instagram/IgPublishModal.tsx`
  - Instalar: `html2canvas`
  - 🔗 Depende de: InstagramModule + R2 (Dev 1)

---

## ✅ Ya implementado y funcionando

### Frontend

- [x] ✅ `Button`, `Input`, `Card`, `Badge` — componentes UI base
- [x] ✅ `EmpresaSidebar` + `EmpresaHeader` + `Providers`
- [x] ✅ `globals.css`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- [x] ✅ `middleware.ts` — estructura lista (pass-through por ahora)
- [x] ✅ `LandingHero`, `LandingFeatures`, `LandingHowItWorks`, `LandingCTA`
- [x] ✅ `RegistroEmpresaForm` — Google OAuth + email/password
- [x] ✅ `LoginEmpresaForm` — Google OAuth + email/password
- [x] ✅ Dashboard completo — stats, link, próximo partido, actividad, top 5
- [x] ✅ `ProdeLogin` — nombre + email + celular + recordarme + términos + validación
- [x] ✅ `ProdeApp` — home, pronosticar (con lock), ranking, resultados, perfil (mock)
- [x] ✅ `lib/supabase/` — client.ts, server.ts, middleware.ts
- [x] ✅ `lib/meta/whatsapp.ts` + `lib/meta/instagram.ts`
- [x] ✅ `lib/football/index.ts`, `lib/geolocation/index.ts`, `lib/qr/index.ts`
- [x] ✅ `stores/prodeStore.ts` — Zustand persistido
- [x] ✅ `types/index.ts` — todos los tipos del dominio

### Backend

- [x] ✅ `SupabaseService` — cliente service role, global module
- [x] ✅ `SupabaseAuthGuard` — verifica JWT Supabase
- [x] ✅ `PredictionsModule` — save + lock 5 min + upsert + validación
- [x] ✅ `LeaderboardModule` — scoring 3/1/0 + recalculate + getLeaderboard
- [x] ✅ `NotificationsModule` — WhatsApp sendText + cron recordatorios + cron scoring

### Base de datos

- [x] ✅ Migración completa — tablas, índices, RLS, triggers, enums
- [x] ✅ `get_empresa_stats()` + `recalculate_leaderboard()` — funciones SQL
- [x] ✅ `sync-matches` — Supabase Edge Function (Deno), código completo

---

## 🤝 Coordinación — hacer antes de arrancar en paralelo

- [ ] ⬜ **Contrato de API** — Swagger con todos los endpoints NestJS antes de que Dev 2 integre
- [ ] ⬜ **Auth flow end-to-end** — Dev 1 activa middleware, Dev 2 conecta formularios a Supabase real
- [ ] ⬜ **Presigned URL R2** — Dev 1 expone endpoint, Dev 2 lo usa para subir desde el browser
- [ ] ⬜ **Meta Business** — tramitar verificación YA ⚠️ toma 2-4 semanas

---

## ⚠️ Riesgos

| Riesgo | Impacto | Acción |
|--------|---------|--------|
| Meta Business sin verificar | Alto — bloquea WA + IG | Iniciar trámite esta semana |
| football-data.org sin WC 2026 aún | Alto — sin fixture no hay prode | Confirmar disponibilidad en API |
| MercadoPago cuenta vendedor | Medio — bloquea pagos | Crear cuenta con tiempo |
| NestJS no levanta (módulos vacíos) | Alto — bloquea todo el backend | Prioridad #1 de Dev 1 |

---

## 🗓️ Roadmap sugerido — 5 semanas

### Semana 1 — API levantando
```
Dev 1: Crear los 8 módulos vacíos (stubs mínimos) → NestJS levanta → agregar lógica a businesses + participants
Dev 2: Configuración page + Auth flow completo con Supabase real
```

### Semana 2 — Core gameplay
```
Dev 1: MatchesModule + PrizesModule + R2 presigned URL
Dev 2: ProdeApp datos reales + QR real + Premios page
```

### Semana 3 — Monetización
```
Dev 1: PaymentsModule + webhook MP + PromosModule
Dev 2: Flujo pago UI + Promos page + Participantes/Ranking/Partidos pages
```

### Semana 4 — Integraciones externas
```
Dev 1: InstagramModule + cron Edge Function activo
Dev 2: Modal IG real + Carrusel geo real + Notificaciones page
```

### Semana 5 — Deploy & QA
```
Dev 1: Render + Supabase prod + Cloudflare DNS + R2 buckets
Dev 2: Vercel + testing mobile + performance
Juntos: E2E testing flujo completo empresa → participante
```