-- =============================================
-- GESTIFY — Trial Modal + PRO tracking
-- =============================================
-- Ejecutar en SQL Editor de Supabase

-- 1. Agregar columna pro_since para saber cuándo se activó PRO
DO $$
BEGIN
    IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='pro_since') THEN
        ALTER TABLE public.subscriptions ADD COLUMN pro_since timestamptz DEFAULT NULL;
    END IF;
END $$;

-- 2. Modificar trigger: nuevos usuarios NO inician trial automáticamente
-- El trial se inicia cuando el usuario acepta en el modal de bienvenida
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, trial_start_date, trial_until, plan_name, plan_price, plan_currency)
  VALUES (new.id, now(), NULL, 'gestify_pro', 14999.00, 'ARS');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Actualizar RPC del admin para incluir pro_since
DROP FUNCTION IF EXISTS public.get_admin_subscriptions();

CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    email text,
    trial_until timestamptz,
    paid_until timestamptz,
    pro_since timestamptz,
    plan_name text,
    plan_price numeric,
    created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        s.id,
        s.user_id,
        COALESCE(
            u.email,
            u.raw_user_meta_data->>'email',
            u.raw_app_meta_data->>'email',
            'sin-email'
        )::text AS email,
        s.trial_until,
        s.paid_until,
        s.pro_since,
        s.plan_name,
        s.plan_price,
        s.created_at
    FROM public.subscriptions s
    LEFT JOIN auth.users u ON u.id = s.user_id
    ORDER BY s.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_admin_subscriptions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_subscriptions() TO authenticated;

-- 4. Permitir al usuario update su propia suscripción (para iniciar trial desde el frontend)
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription"
    ON public.subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);
