-- =============================================
-- GESTIFY — Reversión a Mercado Pago Original
-- =============================================

-- 1. Actualizar tabla subscriptions

-- Renombrar la columna principal
DO $$
BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscriptions' and column_name='mobbex_subscription_id') THEN
        ALTER TABLE public.subscriptions RENAME COLUMN mobbex_subscription_id TO mercadopago_subscription_id;
    END IF;
    
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscriptions' and column_name='uala_order_id') THEN
        ALTER TABLE public.subscriptions RENAME COLUMN uala_order_id TO mercadopago_subscription_id;
    END IF;
END $$;

-- Volver a agregar columnas de MP que se habían dropeado
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS mercadopago_payer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS mercadopago_init_point TEXT;

-- 2. Limpiar y recrear índices de MP
DROP INDEX IF EXISTS idx_subscriptions_mobbex_id;
DROP INDEX IF EXISTS idx_subscriptions_uala_order_id;

CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_id 
    ON public.subscriptions(mercadopago_subscription_id);

-- 3. Restaurar función de expiración trials original
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

-- 4. Actualizar tabla payments 
DO $$
BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscription_payments' and column_name='external_payment_id') THEN
        ALTER TABLE public.subscription_payments RENAME COLUMN external_payment_id TO mercadopago_payment_id;
    END IF;
END $$;

-- Eliminar columna provisoria provider
ALTER TABLE public.subscription_payments DROP COLUMN IF EXISTS provider;
