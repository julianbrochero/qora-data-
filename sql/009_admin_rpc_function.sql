-- =============================================
-- GESTIFY — Función RPC para Admin Panel (v2)
-- =============================================
-- Ejecutar en el SQL Editor de Supabase
-- Trae suscripciones + email de auth.users (compatible con Google OAuth)
-- ⚠️ EJECUTAR COMPLETO EN SQL EDITOR

-- Borrar función anterior si existe
DROP FUNCTION IF EXISTS public.get_admin_subscriptions();

-- Crear función que trae emails (busca en email Y en metadata de Google)
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
        COALESCE(
            u.email,
            u.raw_user_meta_data->>'email',
            u.raw_app_meta_data->>'email',
            'sin-email'
        )::text AS email,
        s.trial_until,
        s.paid_until,
        s.plan_name,
        s.plan_price,
        s.created_at
    FROM public.subscriptions s
    LEFT JOIN auth.users u ON u.id = s.user_id
    ORDER BY s.created_at DESC;
$$;

-- Permisos
REVOKE ALL ON FUNCTION public.get_admin_subscriptions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_subscriptions() TO authenticated;
