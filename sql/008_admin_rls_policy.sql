-- =============================================
-- GESTIFY — Política Admin para leer todas las suscripciones
-- =============================================
-- Ejecutar en el SQL Editor de Supabase
-- Esto permite que el admin (brocherojulian72@gmail.com) vea TODAS las filas
-- de la tabla subscriptions, mientras que los demás solo ven la suya.

-- Borrar políticas SELECT viejas para recrearlas
DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin can read all subscriptions" ON public.subscriptions;

-- Política: cada usuario puede leer su propia suscripción
CREATE POLICY "Users can read own subscription"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: el admin puede leer TODAS las suscripciones
CREATE POLICY "Admin can read all subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (auth.jwt() ->> 'email' = 'brocherojulian72@gmail.com');

-- Política: el admin puede actualizar CUALQUIER suscripción (para activar planes)
DROP POLICY IF EXISTS "Admin can update all subscriptions" ON public.subscriptions;
CREATE POLICY "Admin can update all subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING (auth.jwt() ->> 'email' = 'brocherojulian72@gmail.com');

-- Asegurar que RLS está habilitado
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
