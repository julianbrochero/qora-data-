-- =============================================
-- GESTIFY — Migración a Trial Automático por Fechas
-- =============================================

-- 1. Renombrar las columnas existentes para simplificar
DO $$
BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscriptions' and column_name='trial_end_date') THEN
        ALTER TABLE public.subscriptions RENAME COLUMN trial_end_date TO trial_until;
    END IF;
    
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='subscriptions' and column_name='current_period_end') THEN
        ALTER TABLE public.subscriptions RENAME COLUMN current_period_end TO paid_until;
    END IF;
END $$;

-- 2. Eliminar funciones o triggers que forzaban estados manuables
DROP FUNCTION IF EXISTS expire_trials() CASCADE;

-- 3. Crear función para auto-enlazar suscripción cuando se crea usuario
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, trial_start_date, trial_until, plan_name, plan_price, plan_currency)
  VALUES (new.id, now(), now() + interval '7 days', 'gestify_pro', 14999.00, 'ARS');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar si existía antes de volver a crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Activar el trigger en users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_subscription();

-- 4. Modificar RLS temporalmente para que el front pueda hacer select e insert si se trabó algo.
-- Asegurarnos de que tienen la política correcta public.subscriptions
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription"
    ON public.subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);
    
-- Opcional: llenar tabla para los que ya están registrados y no tienen row
INSERT INTO public.subscriptions (user_id, trial_start_date, trial_until)
SELECT id, now(), now() + interval '7 days'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions);
