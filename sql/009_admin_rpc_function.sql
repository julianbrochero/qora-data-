-- =============================================
-- GESTIFY — Función RPC para Admin Panel
-- =============================================
-- Ejecutar en el SQL Editor de Supabase
-- Esta función devuelve las suscripciones con el email del usuario.
-- Solo puede ser llamada por el admin.

CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    email text,
    trial_until timestamptz,
    paid_until timestamptz,
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
        u.email::text,
        s.trial_until,
        s.paid_until,
        s.plan_name,
        s.plan_price,
        s.created_at
    FROM public.subscriptions s
    LEFT JOIN auth.users u ON u.id = s.user_id
    ORDER BY s.created_at DESC;
$$;

-- Revocar acceso público y dar solo a usuarios autenticados
REVOKE ALL ON FUNCTION public.get_admin_subscriptions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_subscriptions() TO authenticated;
