-- =============================================
-- GESTIFY — Migración Mobbex
-- =============================================

-- 1. Actualizar tabla subscriptions

-- Renombrar columna ID Ualá que pusimos recién (o Mercado Pago si saltas directo a Mobbex)
DO $$
BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscriptions' and column_name='uala_order_id') THEN
        ALTER TABLE public.subscriptions RENAME COLUMN uala_order_id TO mobbex_subscription_id;
    END IF;
    
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscriptions' and column_name='mercadopago_subscription_id') THEN
        ALTER TABLE public.subscriptions RENAME COLUMN mercadopago_subscription_id TO mobbex_subscription_id;
    END IF;
END $$;

-- Eliminar basura de MP por si no se corrió antes:
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS mercadopago_payer_id;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS mercadopago_init_point;

-- 2. Actualizar índices
DROP INDEX IF EXISTS idx_subscriptions_uala_order_id;
DROP INDEX IF EXISTS idx_subscriptions_mp_id;

CREATE INDEX IF NOT EXISTS idx_subscriptions_mobbex_id 
    ON public.subscriptions(mobbex_subscription_id);

-- 3. Actualizar función de expiración trials
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void AS $$
BEGIN
    UPDATE public.subscriptions 
    SET subscription_status = 'expired',
        updated_at = NOW()
    WHERE subscription_status = 'trial' 
      AND trial_end_date < NOW()
      AND mobbex_subscription_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Actualizar payments (Si Ualá no llegó a crear external_payment_id)
DO $$
BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscription_payments' and column_name='mercadopago_payment_id') THEN
        ALTER TABLE public.subscription_payments RENAME COLUMN mercadopago_payment_id TO external_payment_id;
    END IF;
END $$;

-- Si había proveedor `uala` o no había -> pasar defaults a `mobbex`
ALTER TABLE public.subscription_payments 
ALTER COLUMN provider SET DEFAULT 'mobbex';
