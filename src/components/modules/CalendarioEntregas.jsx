import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package, List, Menu } from 'lucide-react'

const C = {
  pageBg:      "#f8f9fb",
  bg:          "#ffffff",
  border:      "#d1d5db",
  borderLight: "#e5e7eb",
  primary:     "#334139",
  primarySurf: "#eaf0eb",
  textBlack:   "#0d0d0d",
  textDark:    "#111827",
  textMid:     "#6b7280",
  textLight:   "#9ca3af",
}

const ESTADOS = {
  pendiente:  { label: "Pendiente",  bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  preparando: { label: "Preparando", bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  enviado:    { label: "Enviado",    bg: "#FAF5FF", color: "#9333EA", dot: "#A855F7" },
  entregado:  { label: "Entregado",  bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  cancelado:  { label: "Cancelado",  bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
}

const DAYS_SHORT  = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DAYS_FULL   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const fFecha = (f) => { try { return new Date(f+'T12:00:00').toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'}) } catch { return '' } }
const fMonto = (m) => (parseFloat(m)||0).toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

export default function CalendarioEntregas({ pedidos = [], openModal, onOpenMobileSidebar }) {
  const [currentDate,  setCurrentDate]  = useState(new Date())
  const [selectedDay,  setSelectedDay]  = useState(null) // "YYYY-MM-DD"
  const [vista,        setVista]        = useState('mes') // 'mes' | 'lista'

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const todayKey = new Date().toISOString().split('T')[0]

  // Días del grid mensual
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const start = firstDay === 0 ? 6 : firstDay - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevLast = new Date(year, month, 0).getDate()
    const days = []
    for (let i = start - 1; i >= 0; i--)  days.push({ day: prevLast - i, month: month - 1, year, curr: false })
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, month, year, curr: true })
    while (days.length < 42)               days.push({ day: days.length - daysInMonth - start + 1, month: month + 1, year, curr: false })
    return days
  }, [year, month])

  // Pedidos agrupados por fecha
  const pedidosPorFecha = useMemo(() => {
    const map = {}
    pedidos.forEach(p => {
      if (p.fecha_entrega_estimada) {
        const key = p.fecha_entrega_estimada.split('T')[0]
        if (!map[key]) map[key] = []
        map[key].push(p)
      }
    })
    return map
  }, [pedidos])

  // Vista lista: próximas entregas
  const proximasEntregas = useMemo(() => {
    const entries = Object.entries(pedidosPorFecha)
      .filter(([k]) => k >= todayKey)
      .sort(([a],[b]) => a.localeCompare(b))
    return entries
  }, [pedidosPorFecha, todayKey])

  const pedidosDiaSelected = selectedDay ? (pedidosPorFecha[selectedDay] || []) : []

  const dayKey = (d) => {
    const m = String(d.month + 1).padStart(2, '0')
    const day = String(d.day).padStart(2, '0')
    return `${d.year}-${m}-${day}`
  }

  const isToday = (d) => dayKey(d) === todayKey

  const totalEntregasEste = Object.keys(pedidosPorFecha).filter(k => k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).reduce((s,k) => s + pedidosPorFecha[k].length, 0)

  return (
    <div style={{ minHeight:'100vh', background:C.pageBg, fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @media (max-width:600px){
          .cal-days-header span { display:none }
          .cal-days-header span.short { display:block }
          .cal-cell { min-height:52px !important; padding:4px !important }
          .cal-day-num { width:20px !important; height:20px !important; font-size:10px !important }
        }
        @media (min-width:601px){
          .cal-days-header span.short { display:none }
        }
      `}</style>

      {/* ── Mobile topbar ── */}
      <div className="md:hidden flex items-center h-14 bg-white border-b border-[#e5e7eb] px-4 shrink-0" style={{position:'sticky',top:0,zIndex:40}}>
        <button onClick={onOpenMobileSidebar} className="mr-3 p-1.5 -ml-1 rounded-md text-[#6b7280] hover:bg-[#f3f4f6]" aria-label="Abrir menú">
          <Menu size={20} />
        </button>
        <span className="font-semibold text-sm text-[#111827]">Calendario</span>
      </div>

      {/* ── Header ── */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'16px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:C.textBlack, letterSpacing:'-0.3px' }}>
              Calendario de Entregas
            </h1>
            <p style={{ margin:'2px 0 0', fontSize:12, color:C.textMid }}>
              {totalEntregasEste} entrega{totalEntregasEste!==1?'s':''} en {MONTHS[month]}
            </p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Toggle vista */}
            <div style={{ display:'flex', borderRadius:8, border:`1px solid ${C.borderLight}`, overflow:'hidden', background:C.bg }}>
              {[['mes', <CalendarIcon size={13}/>], ['lista', <List size={13}/>]].map(([k, icon]) => (
                <button key={k} onClick={() => setVista(k)} style={{
                  padding:'6px 12px', border:'none',
                  background: vista===k ? C.primary : 'transparent',
                  color: vista===k ? '#fff' : C.textMid,
                  cursor:'pointer', display:'flex', alignItems:'center', gap:5,
                  fontSize:12, fontWeight:600, transition:'all .12s',
                }}>{icon} {k==='mes'?'Mes':'Lista'}</button>
              ))}
            </div>

            {/* Navegación mes */}
            {vista === 'mes' && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={() => setCurrentDate(new Date(year, month-1, 1))}
                  style={{ width:32, height:32, borderRadius:7, border:`1px solid ${C.borderLight}`, background:C.bg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronLeft size={15} color={C.textDark}/>
                </button>
                <div style={{ fontSize:13, fontWeight:700, color:C.textDark, minWidth:110, textAlign:'center' }}>
                  {MONTHS[month].slice(0,3)} {year}
                </div>
                <button onClick={() => setCurrentDate(new Date(year, month+1, 1))}
                  style={{ width:32, height:32, borderRadius:7, border:`1px solid ${C.borderLight}`, background:C.bg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronRight size={15} color={C.textDark}/>
                </button>
                <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(todayKey) }}
                  style={{ height:32, padding:'0 12px', borderRadius:7, border:`1px solid ${C.borderLight}`, background:C.bg, cursor:'pointer', fontSize:12, fontWeight:600, color:C.textDark }}>
                  Hoy
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── VISTA CALENDARIO ── */}
        {vista === 'mes' && (
          <div style={{ background:C.bg, borderRadius:12, border:`1px solid ${C.borderLight}`, overflow:'hidden' }}>
            {/* Cabecera días */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#f9fafb', borderBottom:`1px solid ${C.borderLight}` }}>
              {DAYS_FULL.map((d,i) => (
                <div key={d} className="cal-days-header" style={{ padding:'9px 4px', textAlign:'center', fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:'0.04em' }}>
                  <span>{d}</span>
                  <span className="short" style={{ display:'none' }}>{DAYS_SHORT[i]}</span>
                </div>
              ))}
            </div>

            {/* Grid días */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
              {calendarDays.map((dObj, idx) => {
                const key   = dayKey(dObj)
                const items = pedidosPorFecha[key] || []
                const today = isToday(dObj)
                const isSel = selectedDay === key && dObj.curr
                const hasItems = items.length > 0 && dObj.curr

                return (
                  <div
                    key={idx}
                    className="cal-cell"
                    onClick={() => { if(dObj.curr) setSelectedDay(prev => prev===key ? null : key) }}
                    style={{
                      minHeight: 90,
                      padding: '6px',
                      borderRight: (idx+1)%7===0 ? 'none' : `1px solid ${C.borderLight}`,
                      borderBottom: idx >= 35 ? 'none' : `1px solid ${C.borderLight}`,
                      background: isSel ? C.primarySurf : dObj.curr ? C.bg : '#fafafa',
                      cursor: dObj.curr ? 'pointer' : 'default',
                      transition:'background .1s',
                    }}
                    onMouseEnter={e => { if(dObj.curr && !isSel) e.currentTarget.style.background='#f9fafb' }}
                    onMouseLeave={e => { if(dObj.curr && !isSel) e.currentTarget.style.background=C.bg }}
                  >
                    {/* Número del día */}
                    <div className="cal-day-num" style={{
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      width:24, height:24, borderRadius:'50%', fontSize:12, fontWeight:700,
                      background: today ? C.primary : isSel ? 'rgba(51,65,57,0.15)' : 'transparent',
                      color: !dObj.curr ? C.textLight : today ? '#fff' : isSel ? C.primary : C.textDark,
                      marginBottom: 4,
                    }}>
                      {dObj.day}
                    </div>

                    {/* Dots de entregas */}
                    {hasItems && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:2, marginBottom:3 }}>
                        {items.slice(0,5).map((p,i) => (
                          <div key={i} style={{
                            width:6, height:6, borderRadius:'50%',
                            background: (ESTADOS[p.estado]||ESTADOS.pendiente).dot,
                          }}/>
                        ))}
                        {items.length > 5 && <div style={{ width:6, height:6, borderRadius:'50%', background:C.textLight }}/>}
                      </div>
                    )}

                    {/* Eventos (solo en pantalla grande) */}
                    {hasItems && (
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        {items.slice(0,2).map(p => {
                          const cfg = ESTADOS[p.estado]||ESTADOS.pendiente
                          return (
                            <div
                              key={p.id}
                              onClick={e => { e.stopPropagation(); openModal?.('ver-pedido', p) }}
                              style={{
                                padding:'2px 5px', borderRadius:3, fontSize:9, fontWeight:700,
                                background:cfg.bg, color:cfg.color,
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                cursor:'pointer',
                              }}
                            >
                              {p.codigo || `#${p.id?.toString().slice(-4)}`}
                            </div>
                          )
                        })}
                        {items.length > 2 && (
                          <div style={{ fontSize:9, color:C.textLight, fontWeight:600, paddingLeft:3 }}>
                            +{items.length-2} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Panel detalle día seleccionado ── */}
        {vista==='mes' && selectedDay && pedidosDiaSelected.length > 0 && (
          <div style={{ marginTop:12, background:C.bg, borderRadius:10, border:`1px solid ${C.borderLight}`, overflow:'hidden' }}>
            <div style={{ padding:'10px 16px', background:'#f9fafb', borderBottom:`1px solid ${C.borderLight}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.textDark }}>
                Entregas {fFecha(selectedDay)} — {pedidosDiaSelected.length} pedido{pedidosDiaSelected.length!==1?'s':''}
              </span>
              <button onClick={() => setSelectedDay(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:C.textLight }}>×</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column' }}>
              {pedidosDiaSelected.map(p => {
                const cfg = ESTADOS[p.estado]||ESTADOS.pendiente
                return (
                  <div
                    key={p.id}
                    onClick={() => openModal?.('ver-pedido', p)}
                    style={{
                      padding:'10px 16px', borderBottom:`1px solid ${C.borderLight}`,
                      display:'flex', alignItems:'center', gap:12, cursor:'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot, flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.textDark }}>{p.codigo || `#${p.id?.toString().slice(-4)}`}</div>
                      <div style={{ fontSize:11, color:C.textMid }}>{p.cliente_nombre || 'Consumidor final'}</div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:cfg.color, background:cfg.bg, padding:'2px 8px', borderRadius:4 }}>{cfg.label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.textDark, flexShrink:0 }}>{fMonto(p.total)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── VISTA LISTA ── */}
        {vista === 'lista' && (
          <div style={{ background:C.bg, borderRadius:12, border:`1px solid ${C.borderLight}`, overflow:'hidden' }}>
            {proximasEntregas.length === 0 ? (
              <div style={{ padding:'48px 24px', textAlign:'center' }}>
                <Package size={32} color={C.textLight} style={{ marginBottom:12 }}/>
                <p style={{ margin:0, fontSize:14, color:C.textMid }}>No hay entregas programadas próximamente</p>
              </div>
            ) : (
              proximasEntregas.map(([dateKey, items]) => {
                const isHoy = dateKey === todayKey
                const d = new Date(dateKey+'T12:00:00')
                const label = isHoy ? 'Hoy' : d.toLocaleDateString('es-AR',{weekday:'short',day:'2-digit',month:'short'})
                return (
                  <div key={dateKey}>
                    {/* Separador fecha */}
                    <div style={{
                      padding:'6px 16px', background: isHoy ? C.primarySurf : '#f9fafb',
                      borderBottom:`1px solid ${C.borderLight}`,
                      display:'flex', alignItems:'center', gap:8,
                    }}>
                      <span style={{ fontSize:11, fontWeight:800, color: isHoy ? C.primary : C.textMid, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        {label}
                      </span>
                      <span style={{ fontSize:11, color:C.textLight }}>·  {items.length} entrega{items.length!==1?'s':''}</span>
                    </div>
                    {/* Pedidos del día */}
                    {items.map(p => {
                      const cfg = ESTADOS[p.estado]||ESTADOS.pendiente
                      return (
                        <div
                          key={p.id}
                          onClick={() => openModal?.('ver-pedido', p)}
                          style={{ padding:'11px 16px', borderBottom:`1px solid ${C.borderLight}`, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                          <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot, flexShrink:0 }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:C.textDark, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {p.codigo || `#${p.id?.toString().slice(-4)}`}
                            </div>
                            <div style={{ fontSize:11, color:C.textMid }}>{p.cliente_nombre || 'Consumidor final'}</div>
                          </div>
                          <div style={{ fontSize:12, fontWeight:700, color:cfg.color, background:cfg.bg, padding:'2px 8px', borderRadius:4, flexShrink:0 }}>{cfg.label}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:C.textDark, flexShrink:0 }}>{fMonto(p.total)}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Leyenda estados ── */}
        <div style={{ marginTop:14, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          {Object.entries(ESTADOS).map(([k, cfg]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:cfg.dot }}/>
              <span style={{ fontSize:11, color:C.textMid, fontWeight:500 }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
