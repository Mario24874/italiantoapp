-- ============================================================
-- ItaliantoApp — Supabase Schema v1.0
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- NOTA: RLS está desactivado para desarrollo rápido.
-- Activar y configurar políticas antes de ir a producción.
-- ============================================================

-- ─────────────────────────────────────────
-- Tabla: users
-- Sincronizada con Clerk via webhook o llamada directa desde la app
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                      TEXT PRIMARY KEY,           -- Clerk user ID
  email                   TEXT UNIQUE NOT NULL,
  revenuecat_customer_id  TEXT UNIQUE,                -- Se llena en Fase 2
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- Tabla: subscriptions
-- Una fila por usuario. Se crea como 'free' en el primer login.
-- RevenueCat webhook actualizará plan_type y status en Fase 2.
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id                         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status                          TEXT NOT NULL DEFAULT 'free'
                                    CHECK (status IN ('free', 'active', 'canceled', 'past_due')),
  plan_type                       TEXT NOT NULL DEFAULT 'free'
                                    CHECK (plan_type IN ('free', 'mensile', 'annuale', 'lifetime')),
  current_period_end              TIMESTAMPTZ,
  cancel_at_period_end            BOOLEAN DEFAULT false,
  tutor_sessions_used_this_month  INT DEFAULT 0,
  usage_reset_at                  TIMESTAMPTZ DEFAULT date_trunc('month', now()),
  created_at                      TIMESTAMPTZ DEFAULT now(),
  updated_at                      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- ─────────────────────────────────────────
-- Tabla: tutor_sessions
-- Registro de cada sesión con el AI Tutor (Fase 3)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tutor_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  duration_seconds  INT NOT NULL DEFAULT 0,
  errors_corrected  INT DEFAULT 0,
  topics            TEXT[] DEFAULT '{}',
  messages          JSONB DEFAULT '[]',              -- historial de conversación
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- Tabla: usage_stats
-- Estadísticas diarias de uso por usuario
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date                  DATE NOT NULL DEFAULT CURRENT_DATE,
  translations_count    INT DEFAULT 0,
  conjugations_count    INT DEFAULT 0,
  pronunciations_count  INT DEFAULT 0,
  tutor_minutes         FLOAT DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ─────────────────────────────────────────
-- Función: increment_tutor_sessions
-- Incrementa el contador mensual de sesiones del tutor
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_tutor_sessions(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.subscriptions
  SET
    tutor_sessions_used_this_month = tutor_sessions_used_this_month + 1,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────
-- Función: reset_monthly_usage
-- Ejecutar mensualmente via cron (cron-job.org o pg_cron)
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE public.subscriptions
  SET
    tutor_sessions_used_this_month = 0,
    usage_reset_at = date_trunc('month', now()),
    updated_at = now()
  WHERE usage_reset_at < date_trunc('month', now());
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user_id ON public.tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_date ON public.usage_stats(user_id, date);

-- ─────────────────────────────────────────
-- Row Level Security
-- TODO: Activar antes de producción.
-- Por ahora desactivado para simplificar desarrollo.
-- ─────────────────────────────────────────
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- Límites por plan (referencia)
-- ─────────────────────────────────────────
-- free:     0 sesiones tutor/mes
-- mensile:  30 sesiones tutor/mes  ($9.99/mes)
-- annuale:  90 sesiones tutor/mes  ($79.99/año)
-- lifetime: ilimitado              ($199.99 único)
-- ─────────────────────────────────────────
