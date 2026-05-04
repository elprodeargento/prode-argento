# 🏆 Prode Mundial 2026 — Board de Progreso

> Actualizado: Mayo 2026 · Estado general: **38% completado**

---

## Leyenda

| Símbolo | Estado |
|---------|--------|
| ✅ | Completado |
| 🔄 | En progreso |
| ⬜ | Pendiente |
| 🔗 | Depende de otra tarea |

---

## 📊 Resumen por área

| Área | Completado | Total | % |
|------|-----------|-------|---|
| Frontend — Estructura & UI | 8 | 8 | 100% |
| Frontend — Landing | 4 | 4 | 100% |
| Frontend — Auth empresa | 2 | 2 | 100% |
| Frontend — Panel empresa | 1 | 8 | 12% |
| Frontend — Vista participante | 2 | 4 | 50% |
| Backend — Infraestructura | 2 | 5 | 40% |
| Backend — Módulos NestJS | 3 | 10 | 30% |
| Base de datos | 3 | 3 | 100% |
| Integraciones externas | 0 | 5 | 0% |
| Deploy | 0 | 3 | 0% |

---

## 👤 Dev 1 — Backend & Infra

### NestJS — Módulos

- [ ] ⬜ **BusinessesModule** — CRUD empresa, crear al registrar, editar config, cambiar plan
  - `apps/api/src/modules/businesses/`
  - Archivos: `businesses.module.ts` · `businesses.controller.ts` · `businesses.service.ts` · `dto/create-business.dto.ts` · `dto/update-business.dto.ts`

- [ ] ⬜ **ParticipantsModule** — registro, validar límite de plan (Free ≤ 5), lista por empresa
  - `apps/api/src/modules/participants/`
  - Archivos: `participants.module.ts` · `participants.controller.ts` · `participants.service.ts` · `dto/create-participant.dto.ts`

- [ ] ⬜ **MatchesModule** — sync football-data.org, CRUD resultados, partidos por fecha
  - `apps/api/src/modules/matches/`
  - Archivos: `matches.module.ts` · `matches.controller.ts` · `matches.service.ts`
  - Depende de: cron en Supabase Edge Function

- [ ] ⬜ **PrizesModule** — CRUD premios por empresa, upsert masivo desde config
  - `apps/api/src/modules/prizes/`
  - Archivos: `prizes.module.ts` · `prizes.controller.ts` · `prizes.service.ts` · `dto/upsert-prizes.dto.ts`

- [ ] ⬜ **PromosModule** — CRUD promos, validar Plan Pro, endpoint geo, incrementar views
  - `apps/api/src/modules/promos/`
  - Archivos: `promos.module.ts` · `promos.controller.ts` · `promos.service.ts` · `dto/create-promo.dto.ts`

- [ ] ⬜ **InstagramModule** — OAuth Meta, publish-podio, revocar acceso
  - `apps/api/src/modules/instagram/`
  - Archivos: `instagram.module.ts` · `instagram.controller.ts` · `instagram.service.ts`
  - Depende de: cuenta Meta Business aprobada

- [ ] ⬜ **PaymentsModule** — crear preferencia MP, webhook HMAC, activar plan en DB
  - `apps/api/src/modules/payments/`
  - Archivos: `payments.module.ts` · `payments.controller.ts` · `payments.service.ts`
  - Impacta: `apps/web/src/app/api/webhooks/mercadopago/route.ts`

### Infraestructura

- [ ] ⬜ **Cloudflare R2** — upload de logos, promos, podio, QRs
  - `apps/web/src/lib/storage/r2.ts` (nuevo)
  - Instalar: `@aws-sdk/client-s3`
  - Endpoint presigned URL expuesto desde NestJS

- [ ] ⬜ **Supabase Auth Middleware** — proteger rutas `/empresa/*`, refresh de sesión
  - `apps/web/middleware.ts` — activar lógica real (actualmente pass-through)
  - `apps/web/src/lib/supabase/middleware.ts` — ya implementado, conectar

- [ ] ⬜ **Supabase Edge Function cron** — ejecutar `sync-matches` cada 5 min
  - `supabase/functions/sync-matches/index.ts` — ya implementado
  - Configurar en Supabase Dashboard → Edge Functions → Schedule

- [ ] ⬜ **Deploy Render** — NestJS en Docker, health check, env vars, CI/CD
  - `apps/api/Dockerfile` — ya existe
  - Crear: `render.yaml` · configurar auto-deploy desde rama `main`

- [ ] ⬜ **Deploy Vercel** — Next.js, env vars, redirects de dominio
  - Crear: `vercel.json`
  - Configurar dominios: `prode.ar` y `*.prode.ar`

---

## 👤 Dev 2 — Frontend & UX

### Panel empresa — Páginas a implementar

- [ ] ⬜ **Configuración** — upload logo a R2, color, premios, fecha límite, welcome msg
  - `apps/web/src/app/(empresa)/empresa/configuracion/page.tsx`
  - Crear: `apps/web/src/components/empresa/ConfigForm.tsx`
  - Depende de: R2 upload (Dev 1)

- [ ] ⬜ **Participantes** — tabla con búsqueda, filtro, paginación, exportar CSV, notificar
  - `apps/web/src/app/(empresa)/empresa/participantes/page.tsx`
  - Crear: `apps/web/src/components/empresa/ParticipantesTable.tsx`
  - Depende de: ParticipantsModule (Dev 1)

- [ ] ⬜ **Ranking** — podio visual, tabla completa desde leaderboard_cache, botón publicar IG
  - `apps/web/src/app/(empresa)/empresa/ranking/page.tsx`
  - Crear: `apps/web/src/components/empresa/RankingPodio.tsx`
  - Crear: `apps/web/src/components/instagram/IgPublishModal.tsx`
  - Depende de: InstagramModule (Dev 1)

- [ ] ⬜ **Partidos** — listado por fecha, resultados reales, cobertura pronósticos, badge live
  - `apps/web/src/app/(empresa)/empresa/partidos/page.tsx`
  - Crear: `apps/web/src/components/empresa/PartidosList.tsx`
  - Depende de: MatchesModule (Dev 1)

- [ ] ⬜ **Premios** — lista editable, agregar/quitar puestos, imagen por premio a R2
  - `apps/web/src/app/(empresa)/empresa/premios/page.tsx`
  - Crear: `apps/web/src/components/empresa/PremiosList.tsx`
  - Depende de: PrizesModule (Dev 1)

- [ ] ⬜ **Promos** — formulario + preview vivo, lista activas/vencidas, views, gate Plan Pro
  - `apps/web/src/app/(empresa)/empresa/promos/page.tsx`
  - Crear: `apps/web/src/components/empresa/PromoForm.tsx`
  - Depende de: PromosModule (Dev 1)

- [ ] ⬜ **Notificaciones** — selector destinatarios, campo mensaje, historial de envíos
  - `apps/web/src/app/(empresa)/empresa/notificaciones/page.tsx`
  - Crear: `apps/web/src/components/empresa/NotifForm.tsx`
  - Depende de: NotificationsModule (ya implementado en Dev 1)

### Flujos pendientes

- [ ] ⬜ **QR real** — generar QR con `qrcode`, descargar como PNG, conectar al slug real
  - `apps/web/src/lib/qr/index.ts` — ya implementado
  - `apps/web/src/components/empresa/LinkGenerado.tsx` (nuevo)

- [ ] ⬜ **Flujo de pago MercadoPago** — SDK, botones upgrade, Checkout Pro, página retorno
  - `apps/web/src/lib/mercadopago/index.ts` — stub, instalar SDK: `npm install mercadopago`
  - Crear: `apps/web/src/app/pago/[result]/page.tsx`
  - Depende de: PaymentsModule (Dev 1)

- [ ] ⬜ **ProdeApp — datos reales** — reemplazar mocks por Supabase real
  - `apps/web/src/components/prode/ProdeApp.tsx` — datos hardcodeados actualmente
  - Conectar: partidos desde `matches`, ranking desde `leaderboard_cache`
  - Guardar predicciones vía `POST /api/v1/predictions`

- [ ] ⬜ **Carrusel promos geolocalizadas real** — pedir GPS, llamar endpoint, filtrar
  - `apps/web/src/components/prode/PromoCarrusel.tsx` (nuevo, actualmente en ProdeApp)
  - `apps/web/src/lib/geolocation/index.ts` — ya implementado
  - Depende de: PromosModule (Dev 1)

- [ ] ⬜ **Modal IG — publicar podio real** — html2canvas → R2 → API → feedback
  - `apps/web/src/components/instagram/IgPublishModal.tsx` (nuevo)
  - Instalar: `html2canvas`
  - Depende de: InstagramModule (Dev 1) + R2 (Dev 1)

---

## ✅ Completado (ambos)

### Frontend — Estructura & Componentes

- [x] ✅ **Componentes UI base** — `Button`, `Input`, `Card`, `Badge`
- [x] ✅ **EmpresaSidebar** — navegación con active state
- [x] ✅ **EmpresaHeader** — breadcrumb + acciones
- [x] ✅ **Providers** — QueryClient wrapper
- [x] ✅ **globals.css** — Tailwind v4 + fuentes
- [x] ✅ **next.config.ts** — configuración base
- [x] ✅ **tailwind.config.ts** — colores de marca
- [x] ✅ **middleware.ts** — estructura lista (pass-through)

### Frontend — Landing

- [x] ✅ **LandingHero** — hero con animación, CTA
- [x] ✅ **LandingFeatures** — grid de 6 features
- [x] ✅ **LandingHowItWorks** — pasos con timeline
- [x] ✅ **LandingCTA** — sección final de conversión

### Frontend — Auth empresa

- [x] ✅ **RegistroEmpresaForm** — Google OAuth + email/password + plan Free
- [x] ✅ **LoginEmpresaForm** — Google OAuth + email/password

### Frontend — Panel empresa

- [x] ✅ **Dashboard completo** — stats, link, próximo partido, actividad, ranking top 5

### Frontend — Vista participante

- [x] ✅ **ProdeLogin** — nombre + email + celular + recordarme + términos con validación
- [x] ✅ **ProdeApp** — home, pronosticar (con lock), ranking, resultados, perfil (con datos mock)

### Backend — Infraestructura

- [x] ✅ **SupabaseService** — cliente con service role key, global module
- [x] ✅ **SupabaseAuthGuard** — verifica JWT en endpoints protegidos

### Backend — Módulos

- [x] ✅ **PredictionsModule** — save con lock 5 min + upsert + validación de plan
- [x] ✅ **LeaderboardModule** — scoring 3/1/0 + recalculate_leaderboard() + getLeaderboard()
- [x] ✅ **NotificationsModule** — sendText WhatsApp + cron cada hora + cada 5 min

### Base de datos

- [x] ✅ **Migración inicial** — todas las tablas, índices, RLS, triggers
- [x] ✅ **Funciones SQL** — `get_empresa_stats()` + `recalculate_leaderboard()`
- [x] ✅ **Edge Function sync-matches** — sync desde football-data.org (Deno)

---

## 🤝 Coordinación conjunta (hacer antes de arrancar)

- [ ] ⬜ **Contrato de API** — definir y documentar en Swagger todos los endpoints NestJS que consume el frontend antes de que Dev 2 empiece a integrar
- [ ] ⬜ **Auth flow completo** — Dev 1 activa middleware, Dev 2 conecta formularios a Supabase real y maneja redirecciones post-OAuth
- [ ] ⬜ **Presigned URL para R2** — Dev 1 expone endpoint, Dev 2 lo consume desde browser para subir imágenes directamente a Cloudflare
- [ ] ⬜ **Meta Business verification** — tramitar cuenta verificada para WhatsApp y templates aprobados ⚠️ toma 2-4 semanas

---

## ⚠️ Riesgos y bloqueos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Meta Business verification | Alto — bloquea WhatsApp + IG | Iniciar trámite YA, no esperar |
| football-data.org sin fixture WC 2026 | Alto — sin partidos no hay prode | Confirmar disponibilidad en el API |
| MercadoPago aprobación de cuenta | Medio — bloquea pagos | Crear cuenta de vendedor con tiempo |
| Límite free tier Supabase (500MB) | Bajo — si escala mucho | Upgradar a Pro ($25/mes) a tiempo |

---

## 📋 Orden sugerido de ejecución

### Semana 1 — Foundations
```
Dev 1: BusinessesModule + ParticipantsModule + Auth middleware activo
Dev 2: Configuración + Auth flow completo con Supabase real
```

### Semana 2 — Core gameplay
```
Dev 1: MatchesModule + PrizesModule + R2 upload
Dev 2: ProdeApp con datos reales + QR real + Premios page
```

### Semana 3 — Monetización
```
Dev 1: PaymentsModule + webhook MP + PromosModule
Dev 2: Flujo de pago UI + Promos page + Participantes/Ranking/Partidos pages
```

### Semana 4 — Integraciones externas
```
Dev 1: InstagramModule + NotificationsModule cron activo + Edge Function cron
Dev 2: Modal IG real + Carrusel geo real + Notificaciones page
```

### Semana 5 — Deploy & QA
```
Dev 1: Deploy Render + Supabase prod + Cloudflare DNS
Dev 2: Deploy Vercel + testing mobile + performance
Juntos: E2E testing del flujo completo empresa → participante
```