-- ============================================================
-- MIGRACIÓN: Agregar pedido_id a facturas como FK a pedidos
-- ============================================================
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna pedido_id (UUID, igual que pedidos.id)
ALTER TABLE facturas 
ADD COLUMN IF NOT EXISTS pedido_id UUID REFERENCES pedidos(id);

-- 2. Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_facturas_pedido_id ON facturas(pedido_id);

-- 3. Verificar resultado
SELECT 
  COUNT(*) as total_facturas,
  COUNT(pedido_id) as con_pedido_id,
  COUNT(*) - COUNT(pedido_id) as sin_pedido_id
FROM facturas;
