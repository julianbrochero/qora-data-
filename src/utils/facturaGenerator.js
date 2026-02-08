// utils/facturaGenerator.js
export const generarNumeroFactura = (tipoFactura, ultimaFactura = null) => {
  let ultimoNumero = 0
  
  if (ultimaFactura && ultimaFactura.numero) {
    // Extraer número de factura existente
    const matches = ultimaFactura.numero.match(/\d+/g)
    if (matches) {
      ultimoNumero = parseInt(matches[matches.length - 1]) || 0
    }
  }
  
  // Prefijo según tipo de factura
  let prefijo = ''
  switch (tipoFactura) {
    case 'Factura A':
      prefijo = 'FA-'
      break
    case 'Factura B':
      prefijo = 'FB-'
      break
    case 'Factura C':
      prefijo = 'FC-'
      break
    case 'Factura E':
      prefijo = 'FE-'
      break
    default:
      prefijo = 'F-'
  }
  
  // Formato: PREFIJO + AÑO + MES + NÚMERO CORRELATIVO (8 dígitos)
  const ahora = new Date()
  const anio = ahora.getFullYear().toString().slice(-2)
  const mes = (ahora.getMonth() + 1).toString().padStart(2, '0')
  const numeroCorrelativo = (ultimoNumero + 1).toString().padStart(4, '0')
  
  return `${prefijo}${anio}${mes}${numeroCorrelativo}`
}

// Para generar resumen de deudas
export const calcularResumenDeudas = (facturas) => {
  const facturasSeguras = Array.isArray(facturas) ? facturas : []
  
  const totalDeuda = facturasSeguras
    .filter(f => f.estado !== 'pagada')
    .reduce((sum, f) => sum + (parseFloat(f.saldoPendiente) || parseFloat(f.total) || 0), 0)
  
  const facturasPendientes = facturasSeguras.filter(f => f.estado !== 'pagada').length
  
  const clientesDeudores = [
    ...new Set(
      facturasSeguras
        .filter(f => f.estado !== 'pagada')
        .map(f => f.cliente_nombre || f.cliente)
        .filter(Boolean)
    )
  ].length
  
  return {
    totalDeuda,
    facturasPendientes,
    clientesDeudores
  }
}

// Formatear montos
export const formatearMonto = (monto) => {
  const numero = parseFloat(monto) || 0
  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}