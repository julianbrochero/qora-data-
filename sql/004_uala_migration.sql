-- =============================================
-- GESTIFY — Migración a Ualá Bis
-- =============================================

-- 1. Actualizar tabla subscriptions

-- Renombrar columna ID
ALTER TABLE public.subscriptions 
RENAME COLUMN mercadopago_subscription_id TO uala_order_id;

-- Renombrar o eliminar columnas que ya no aplican de MP y agregar si hace falta
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS mercadopago_payer_id;

ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS mercadopago_init_point;

-- 2. Actualizar índices
DROP INDEX IF EXISTS idx_subscriptions_mp_id;
CREATE INDEX IF NOT EXISTS idx_subscriptions_uala_order_id 
    ON public.subscriptions(uala_order_id);

-- 3. Actualizar función de expiración trials (quitar referencia MP)
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void AS $$
BEGIN
    UPDATE public.subscriptions 
    SET subscription_status = 'expired',
        updated_at = NOW()
    WHERE subscription_status = 'trial' 
      AND trial_end_date < NOW()
      AND uala_order_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Actualizar tabla subscription_payments
ALTER TABLE public.subscription_payments 
RENAME COLUMN mercadopago_payment_id TO external_payment_id;

-- Opcional: Agregar columna de proveedor
ALTER TABLE public.subscription_payments 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'uala';
