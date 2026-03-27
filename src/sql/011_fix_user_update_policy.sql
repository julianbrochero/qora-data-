-- =============================================
-- GESTIFY — Fix: Permitir al usuario actualizar su propia suscripción
-- =============================================
-- ⚠️ EJECUTAR EN SUPABASE → SQL EDITOR
-- Sin esto, el usuario NO puede activar PRO desde el modal de pago.

-- Permitir que el usuario actualice su propia suscripción
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription"
    ON public.subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- También permitir INSERT para el auto-create (si el trigger falla)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
