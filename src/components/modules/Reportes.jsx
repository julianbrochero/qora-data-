"use client"

import React, { useState, useMemo } from 'react'
import { Calendar, Users, Package, BarChart3, DollarSign, TrendingUp, TrendingDown, Download, Filter, Search, ChevronLeft, ChevronRight, Menu } from "lucide-react"

/* ══════════════════════════════════════════════
   PALETA GESTIFY
══════════════════════════════════════════════ */
const bg = '#F5F5F5'
const surface = '#FAFAFA'
const surface2 = '#FFFFFF'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const cardShadow = '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)'

const inputStyle = {
  background: 'transparent',
  border: 'none', outline: 'none',
  fontSize: 12, fontFamily: "'Inter', sans-serif",
  color: ct1, width: '100%',
}
const pillSelect = {
  height: 32, padding: '0 24px 0 12px', fontSize: 11, fontWeight: 600,
  color: ct2, background: surface2, border: `1px solid ${border}`,
  borderRadius: 8, outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8982' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  fontFamily: "'Inter', sans-serif", transition: 'border-color .15s'
}

const Reportes = ({ facturas = [], pedidos = [], clientes = [], productos = [], searchTerm = "", setSearchTerm, onOpenMobileSidebar }) => {
  const [periodo, setPeriodo] = useState("mes")
  const anioActualReal = new Date().getFullYear()
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActualReal)

  const facturasSafe = Array.isArray(facturas) ? facturas : []
  const hoy = new Date()
  const fechaFiltro = new Date()

  if (periodo === "dia") { fechaFiltro.setHours(0, 0, 0, 0) }
  else if (periodo === "semana") { fechaFiltro.setDate(hoy.getDate() - 7); fechaFiltro.setHours(0, 0, 0, 0) }
  else if (periodo === "mes") { fechaFiltro.setDate(1); fechaFiltro.setHours(0, 0, 0, 0) }
  else if (periodo === "anio") { fechaFiltro.setMonth(0, 1); fechaFiltro.setHours(0, 0, 0, 0) }
  else { fechaFiltro.setFullYear(2000) }

  const facturasFiltradas = facturasSafe.filter(f => {
    const d = new Date(f.fecha + 'T00:00:00')
    const coincideFecha = d >= fechaFiltro
    const searchSafe = (searchTerm || "").toLowerCase()
    const coincideBusqueda = String(f.numero || "").toLowerCase().includes(searchSafe) || String(f.cliente || f.cliente_nombre || "").toLowerCase().includes(searchSafe)
    return coincideFecha && coincideBusqueda
  })

  // Métricas
  const estadisticas = useMemo(() => {
    let ventasTotal = 0, cobradoTotal = 0, clientesActivos = new Set(), productosCount = 0
    let costoTotal = 0, gananciaTotal = 0, itemsConCosto = 0
    facturasFiltradas.forEach(f => {
      if (f.estado !== 'anulada') {
        ventasTotal += (parseFloat(f.total) || 0)
        cobradoTotal += (parseFloat(f.montopagado) || 0)
        let nomCli = f.cliente_nombre || f.cliente
        if (nomCli) clientesActivos.add(nomCli)
        let itemsArr = []
        try { itemsArr = typeof f.items === 'string' ? JSON.parse(f.items) : (f.items || []) } catch (e) { }
        itemsArr.forEach(i => {
          productosCount += (parseFloat(i.cantidad) || 0)
          const c = parseFloat(i.costo)
          if (c > 0) {
            const gan = parseFloat(i.ganancia)
            costoTotal += isNaN(gan) ? c * (parseFloat(i.cantidad) || 1) : (parseFloat(i.subtotal) || 0) - (c * (parseFloat(i.cantidad) || 1))
            gananciaTotal += isNaN(gan) ? 0 : gan
            costoTotal    += isNaN(gan) ? 0 : c * (parseFloat(i.cantidad) || 1)
            itemsConCosto++
          }
        })
      }
    })
    const margenPorc = gananciaTotal > 0 && (gananciaTotal + costoTotal) > 0 ? (gananciaTotal / (gananciaTotal + costoTotal)) * 100 : null
    return { ventasTotales: ventasTotal, cobradoTotal, clientesActivos: clientesActivos.size, productosVendidos: productosCount, costoTotal, gananciaTotal, margenPorc, hayGanancias: itemsConCosto > 0 }
  }, [facturasFiltradas])

  // Gráfico semanal
  const chartSieteDias = useMemo(() => {
    const dias = [], ventasPorDia = [0, 0, 0, 0, 0, 0, 0], nombresDias = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(hoy.getDate() - i)
      dias.push(d.toISOString().split('T')[0])
      nombresDias.push(d.toLocaleDateString('es-ES', { weekday: 'short' }))
    }
    facturasSafe.forEach(f => {
      const index = dias.indexOf(f.fecha)
      if (index !== -1 && f.estado !== 'anulada') ventasPorDia[index] += (parseFloat(f.total) || 0)
    })
    const maxDia = Math.max(...ventasPorDia, 1)
    const porcentajes = ventasPorDia.map(v => (v / maxDia) * 100)
    return { nombresDias, ventasPorDia, porcentajes, total: ventasPorDia.reduce((a, b) => a + b, 0) }
  }, [facturasSafe])

  // Top Clientes
  const topClientes = useMemo(() => {
    const mapa = {}
    facturasFiltradas.forEach(f => {
      if (f.estado === 'anulada') return
      const nom = f.cliente_nombre || f.cliente || 'Consumidor Final'
      if (!mapa[nom]) mapa[nom] = { nombre: nom, compras: 0, total: 0 }
      mapa[nom].compras += 1; mapa[nom].total += (parseFloat(f.total) || 0)
    })
    return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [facturasFiltradas])

  // Resumen mensual
  const resumenMensual = useMemo(() => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return meses.map((nombre, idx) => {
      const facturasDelMes = facturasSafe.filter(f => {
        if (f.estado === 'anulada') return false
        const d = new Date(f.fecha + 'T00:00:00')
        return d.getFullYear() === anioSeleccionado && d.getMonth() === idx
      })
      const pedidosDelMes = Array.isArray(pedidos) ? pedidos.filter(p => {
        const d = new Date((p.created_at || p.fecha || '').split('T')[0] + 'T00:00:00')
        return d.getFullYear() === anioSeleccionado && d.getMonth() === idx
      }) : []
      // Calcular ganancia del mes desde items JSON
      let gananciaMes = 0, hayGanMes = false
      facturasDelMes.forEach(f => {
        let items = []
        try { items = typeof f.items === 'string' ? JSON.parse(f.items) : (f.items || []) } catch {}
        items.forEach(i => {
          const gan = parseFloat(i.ganancia)
          if (!isNaN(gan)) { gananciaMes += gan; hayGanMes = true }
        })
      })
      return {
        nombre, idx,
        totalFacturado: facturasDelMes.reduce((s, f) => s + (parseFloat(f.total) || 0), 0),
        totalCobrado: facturasDelMes.reduce((s, f) => s + (parseFloat(f.montopagado) || 0), 0),
        cantFacturas: facturasDelMes.length,
        cantPedidos: pedidosDelMes.length,
        gananciaMes, hayGanMes,
      }
    })
  }, [facturasSafe, pedidos, anioSeleccionado])

  const fCorto = (m) => (parseFloat(m) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const fMonto = (m) => (parseFloat(m) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const kpis = [
    { label: 'Total Facturado', val: `$${fCorto(estadisticas.ventasTotales)}`, icon: DollarSign, color: '#1E40AF' },
    { label: 'Total Cobrado', val: `$${fCorto(estadisticas.cobradoTotal)}`, icon: TrendingUp, color: '#065F46' },
    { label: 'Clientes Atendidos', val: estadisticas.clientesActivos, icon: Users, color: '#6D28D9' },
    { label: 'Unidades Vendidas', val: estadisticas.productosVendidos, icon: Package, color: '#92400E' },
    ...(estadisticas.hayGanancias ? [
      { label: 'Ganancia Bruta', val: `$${fCorto(estadisticas.gananciaTotal)}`, icon: TrendingUp, color: '#059669' },
      { label: 'Margen promedio', val: estadisticas.margenPorc !== null ? `${estadisticas.margenPorc.toFixed(1)}%` : '—', icon: BarChart3, color: '#D97706' },
    ] : [])
  ]

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ══ HEADER ══ */}
      <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 clamp(12px, 3vw, 24px)', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', py: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <Menu size={16} strokeWidth={2} />
          </button>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Análisis</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Reportes Estadísticos</h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 32, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .13s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}>
            <Download size={13} strokeWidth={2.5} /> <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </header>

      {/* ══ TOOLBAR BUSCADOR/FILTROS ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative', display: 'flex', alignItems: 'center', background: surface, border: `1px solid ${border}`, borderRadius: 8, height: 32, padding: '0 12px', boxShadow: '0 1px 3px rgba(48,54,47,.04)' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = accent} onBlurCapture={e => e.currentTarget.style.borderColor = border}>
          <Search size={13} style={{ color: ct3, marginRight: 8, flexShrink: 0 }} />
          <input type="text" placeholder="Filtrar por cliente o nro factura..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={inputStyle} />
        </div>
        <select value={periodo} onChange={e => setPeriodo(e.target.value)} style={pillSelect} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border}>
          <option value="dia">Hoy</option>
          <option value="semana">Últimos 7 Días</option>
          <option value="mes">Este Mes</option>
          <option value="anio">Este Año</option>
          <option value="todos">Todo</option>
        </select>
      </div>

      {/* ══ CARDS KPI ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: '#E1E1E0', borderRadius: 12, border: `1px solid ${border}`, boxShadow: cardShadow, height: 76, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = `translateY(-2px)`; e.currentTarget.style.boxShadow = `0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)` }} onMouseLeave={e => { e.currentTarget.style.transform = ``; e.currentTarget.style.boxShadow = cardShadow }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${k.color}15, transparent 70%)` }} />
            <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: k.color, borderRadius: '0 2px 2px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: ct3, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', marginBottom: 2 }}>{k.label}</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: ct1, letterSpacing: '-.03em', display: 'block', lineHeight: 1.1 }}>{k.val}</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={15} strokeWidth={2.5} style={{ color: k.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

        {/* GRÁFICO 7 DIAS */}
        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: ct1 }}>Últimos 7 Días</h3>
              <p style={{ fontSize: 11, color: ct3 }}>Evolución de ventas facturadas</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1E40AF', letterSpacing: '-.04em' }}>${fCorto(chartSieteDias.total)}</span>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 4, height: 160, paddingBottom: 6 }}>
            {chartSieteDias.porcentajes.map((porc, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: ct2, marginBottom: 4 }}>${fCorto(chartSieteDias.ventasPorDia[i])}</div>
                <div style={{ width: '100%', maxWidth: 40, background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)', borderRadius: '4px 4px 0 0', minHeight: chartSieteDias.ventasPorDia[i] > 0 ? 4 : 0, height: `${porc}%`, transition: 'height .3s ease' }} />
                <div style={{ fontSize: 10, color: ct3, marginTop: 6, fontWeight: 600, textTransform: 'capitalize' }}>{chartSieteDias.nombresDias[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP CLIENTES */}
        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: ct1 }}>Top 5 Clientes</h3>
              <p style={{ fontSize: 11, color: ct3 }}>Mejores por volumen comprado</p>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(109,40,217,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={12} strokeWidth={2.5} style={{ color: '#6D28D9' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {topClientes.length > 0 ? topClientes.map((c, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background .13s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: accent }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{c.nombre}</div>
                    <div style={{ fontSize: 10, color: ct3 }}>{c.compras} {c.compras === 1 ? 'compra' : 'compras'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ct2 }}>${fCorto(c.total)}</div>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: 'center', color: ct3, fontSize: 12, fontWeight: 600 }}>No hay ventas en este período.</div>
            )}
          </div>
        </div>
      </div>

      {/* ══ RESUMEN MENSUAL AÑO ══ */}
      <div style={{ padding: '0 clamp(12px, 3vw, 24px) 40px' }}>
        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, overflow: 'hidden' }}>

          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: surface2 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: ct1 }}>Resumen Anual {anioSeleccionado}</h3>
              <p style={{ fontSize: 11, color: ct3 }}>Evolución mes a mes</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: accentL, borderRadius: 8, padding: '4px 8px' }}>
              <button onClick={() => setAnioSeleccionado(a => a - 1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: accent, display: 'flex', alignItems: 'center', padding: 2 }}>
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: accent, width: 40, textAlign: 'center' }}>{anioSeleccionado}</span>
              <button onClick={() => setAnioSeleccionado(a => a + 1)} disabled={anioSeleccionado >= anioActualReal} style={{ background: 'transparent', border: 'none', cursor: anioSeleccionado >= anioActualReal ? 'default' : 'pointer', color: anioSeleccionado >= anioActualReal ? 'rgba(51,65,57,.3)' : accent, display: 'flex', alignItems: 'center', padding: 2 }}>
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
              {anioSeleccionado !== anioActualReal && (
                <button onClick={() => setAnioSeleccionado(anioActualReal)} style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: '#4ADE80', border: 'none', color: '#1e2320', cursor: 'pointer' }}>Hoy</button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: surface2, borderBottom: `1px solid ${border}` }}>
                <tr>
                  {['Mes', 'Facturas', 'Pedidos', 'Facturado', 'Cobrado', 'Ganancia', 'Pendiente'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: i === 5 ? '#059669' : ct3, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumenMensual.map(m => {
                  const esMes = m.idx === new Date().getMonth() && anioSeleccionado === anioActualReal
                  const pend = m.totalFacturado - m.totalCobrado
                  const vacio = m.cantFacturas === 0 && m.cantPedidos === 0

                  return (
                    <tr key={m.idx} style={{ borderBottom: `1px solid ${border}`, background: esMes ? 'rgba(59,130,246,.04)' : vacio ? 'transparent' : surface, opacity: vacio ? .5 : 1, transition: 'background .13s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = esMes ? 'rgba(59,130,246,.08)' : 'rgba(51,65,57,.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = esMes ? 'rgba(59,130,246,.04)' : vacio ? 'transparent' : surface}>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {esMes && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />}
                          <span style={{ fontSize: 12, fontWeight: 600, color: esMes ? '#1D4ED8' : ct2 }}>{m.nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: ct1 }}>{m.cantFacturas || '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: ct1 }}>{m.cantPedidos || '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: ct1 }}>{m.totalFacturado > 0 ? `$${fCorto(m.totalFacturado)}` : '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#065F46' }}>{m.totalCobrado > 0 ? `$${fCorto(m.totalCobrado)}` : '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#059669' }}>
                        {m.hayGanMes ? `+$${fCorto(m.gananciaMes)}` : <span style={{ color: ct3, fontWeight: 400, fontSize: 11 }}>sin datos</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12 }}>
                        {pend > 0 ? <span style={{ fontWeight: 700, color: '#991B1B' }}>${fCorto(pend)}</span>
                          : m.totalFacturado > 0 ? <span style={{ fontWeight: 600, color: '#065F46' }}>✓ Saldado</span>
                            : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot style={{ background: surface2, borderTop: `2px solid ${border}` }}>
                <tr>
                  <td style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: ct1, textTransform: 'uppercase' }}>Total Año</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 800, color: ct1 }}>{resumenMensual.reduce((s, m) => s + m.cantFacturas, 0)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 800, color: ct1 }}>{resumenMensual.reduce((s, m) => s + m.cantPedidos, 0)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: ct1 }}>${fCorto(resumenMensual.reduce((s, m) => s + m.totalFacturado, 0))}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#065F46' }}>${fCorto(resumenMensual.reduce((s, m) => s + m.totalCobrado, 0))}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#059669' }}>
                    {resumenMensual.some(m => m.hayGanMes)
                      ? `+$${fCorto(resumenMensual.reduce((s, m) => s + m.gananciaMes, 0))}`
                      : <span style={{ color: ct3, fontWeight: 400, fontSize: 11 }}>sin datos</span>}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#991B1B' }}>${fCorto(resumenMensual.reduce((s, m) => s + Math.max(0, m.totalFacturado - m.totalCobrado), 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kpiIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

export default Reportes
