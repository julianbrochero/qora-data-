-- =============================================
-- GESTIFY — Sistema de Suscripciones
-- Tabla: subscriptions
-- =============================================

-- 1. Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Estado de la suscripción
    subscription_status TEXT NOT NULL DEFAULT 'trial' 
        CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
    
    -- Trial
    trial_start_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_end_date      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Mercado Pago
    mercadopago_subscription_id  TEXT,
    mercadopago_payer_id         TEXT,
    mercadopago_init_point       TEXT,
    
    -- Período de facturación actual
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    
    -- Metadata
    plan_name       TEXT NOT NULL DEFAULT 'gestify_pro',
    plan_price      NUMERIC(10,2) NOT NULL DEFAULT 14999.00,
    plan_currency   TEXT NOT NULL DEFAULT 'ARS',
    
    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at    TIMESTAMPTZ,
    
    -- Constraint: un usuario solo puede tener una suscripción activa
    CONSTRAINT unique_active_subscription UNIQUE (user_id)
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
    ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
    ON public.subscriptions(subscription_status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_id 
    ON public.subscriptions(mercadopago_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end 
    ON public.subscriptions(trial_end_date) 
    WHERE subscription_status = 'trial';

-- 3. Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- 4. Función para auto-expirar trials vencidos
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void AS $$
BEGIN
    UPDATE public.subscriptions 
    SET subscription_status = 'expired',
        updated_at = NOW()
    WHERE subscription_status = 'trial' 
      AND trial_end_date < NOW()
      AND mercadopago_subscription_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS

-- Los usuarios pueden leer su propia suscripción
CREATE POLICY "Users can read own subscription"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden insertar su propia suscripción (para el trial)
CREATE POLICY "Users can insert own subscription"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Solo el service_role puede actualizar (backend via webhook)
CREATE POLICY "Service role can update subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Solo el service_role puede eliminar
CREATE POLICY "Service role can delete subscriptions"
    ON public.subscriptions
    FOR DELETE
    USING (true);

-- 7. Tabla de historial de pagos (opcional pero recomendada)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    mercadopago_payment_id  TEXT,
    amount                  NUMERIC(10,2) NOT NULL,
    currency                TEXT NOT NULL DEFAULT 'ARS',
    status                  TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    
    payment_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_payments_subscription 
    ON public.subscription_payments(subscription_id);

CREATE INDEX IF NOT EXISTS idx_sub_payments_user 
    ON public.subscription_payments(user_id);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
    ON public.subscription_payments
    FOR SELECT
    USING (auth.uid() = user_id);
