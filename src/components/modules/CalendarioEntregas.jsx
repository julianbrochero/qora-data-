import React, { useState, useMemo } from 'react'
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, User, Clock, Package, Eye
} from 'lucide-react'

const C = {
  pageBg:     "#f8f9fb",
  bg:         "#ffffff",
  border:     "#d1d5db",
  borderLight: "#e5e7eb",
  primary:    "#334139",
  primarySurf:"#eaf0eb",
  textBlack:  "#0d0d0d",
  textDark:   "#111827",
  textMid:    "#6b7280",
  textLight:  "#9ca3af",
}

const ESTADOS = {
  pendiente:  { label: "Pendiente",  bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  preparando: { label: "Preparando", bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  enviado:    { label: "Enviado",    bg: "#FAF5FF", color: "#9333EA", border: "#E9D5FF" },
  entregado:  { label: "Entregado",  bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  cancelado:  { label: "Cancelado",  bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function CalendarioEntregas({ pedidos = [], openModal }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Generar días del mes
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // Obtener el día de la semana del primer día (0=domingo, 1=lunes)
    // Ajustamos para que la semana empiece en Lunes (1)
    let startDay = firstDayOfMonth.getDay() // 0 - 6
    startDay = startDay === 0 ? 6 : startDay - 1 // Ajustar a Lunes=0, Domingo=6

    const days = []
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year: year,
        isCurrentMonth: false
      })
    }

    // Días del mes actual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true
      })
    }

    // Días del mes siguiente para completar la grilla (6 filas)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: year,
        isCurrentMonth: false
      })
    }

    return days
  }, [year, month])

  // Agrupar pedidos por fecha de entrega
  const pedidosPorFecha = useMemo(() => {
    const map = {}
    pedidos.forEach(p => {
      if (p.fecha_entrega_estimada) {
        const dateKey = p.fecha_entrega_estimada.split('T')[0]
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(p)
      }
    })
    return map
  }, [pedidos])

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const isToday = (d, m, y) => {
    const today = new Date()
    return d === today.getDate() && m === today.getMonth() && y === today.getFullYear()
  }

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", background: C.pageBg, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textBlack, letterSpacing: "-0.3px" }}>
            Calendario de Entregas
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: C.textMid }}>
            Gestioná tus ventas según su fecha de entrega programada
          </p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goToToday} style={{
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.borderLight}`,
            background: C.bg, fontSize: 13, fontWeight: 600, color: C.textDark, cursor: "pointer"
          }}>
            Hoy
          </button>
          <div style={{ display: "flex", alignItems: "center", borderRadius: 8, border: `1px solid ${C.borderLight}`, background: C.bg, overflow: "hidden" }}>
            <button onClick={prevMonth} style={{ padding: "6px 10px", border: "none", background: "none", cursor: "pointer", borderRight: `1px solid ${C.borderLight}` }}>
              <ChevronLeft size={16} color={C.textDark} />
            </button>
            <div style={{ padding: "0 16px", fontSize: 14, fontWeight: 700, color: C.textDark, minWidth: 140, textAlign: "center" }}>
              {MONTHS[month]} {year}
            </div>
            <button onClick={nextMonth} style={{ padding: "6px 10px", border: "none", background: "none", cursor: "pointer", borderLeft: `1px solid ${C.borderLight}` }}>
              <ChevronRight size={16} color={C.textDark} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Calendario */}
      <div style={{ 
        background: C.bg, 
        borderRadius: 12, 
        border: `1px solid ${C.borderLight}`,
        overflowX: "auto",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ minWidth: 700 }}>
          {/* Cabecera días */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f9fafb", borderBottom: `1px solid ${C.borderLight}` }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: "10px", textAlign: "center", fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "minmax(120px, auto)" }}>
          {calendarDays.map((dObj, idx) => {
            const date = new Date(dObj.year, dObj.month, dObj.day)
            const dateKey = date.toISOString().split('T')[0]
            const items = pedidosPorFecha[dateKey] || []
            const today = isToday(dObj.day, dObj.month, dObj.year)

            return (
              <div key={idx} style={{ 
                minHeight: 120,
                padding: "8px",
                borderRight: (idx + 1) % 7 === 0 ? "none" : `1px solid ${C.borderLight}`,
                borderBottom: idx >= 35 ? "none" : `1px solid ${C.borderLight}`,
                background: dObj.isCurrentMonth ? C.bg : "#fafafa",
                color: dObj.isCurrentMonth ? C.textDark : C.textLight,
                position: "relative"
              }}>
                <div style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center", 
                  marginBottom: 6, fontSize: 12, fontWeight: 700 
                }}>
                  <span style={{ 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 24, height: 24, borderRadius: "50%",
                    background: today ? C.primary : "transparent",
                    color: today ? "#fff" : "inherit"
                  }}>
                    {dObj.day}
                  </span>
                  {items.length > 0 && (
                    <span style={{ fontSize: 10, color: C.textMid, fontWeight: 500 }}>
                      {items.length} {items.length === 1 ? 'entrega' : 'entregas'}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {items.slice(0, 4).map(p => (
                    <div 
                      key={p.id}
                      onClick={() => openModal("editar-pedido", p)}
                      style={{
                        padding: "3px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: (ESTADOS[p.estado] || ESTADOS.pendiente).bg,
                        color: (ESTADOS[p.estado] || ESTADOS.pendiente).color,
                        border: `1px solid ${(ESTADOS[p.estado] || ESTADOS.pendiente).border}`,
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        whiteSpace: "nowrap",
                        transition: "all 0.1s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.95)"}
                      onMouseLeave={e => e.currentTarget.style.filter = "none"}
                    >
                      #{p.codigo?.slice(-3) || p.id.toString().slice(-3)} {p.cliente_nombre}
                    </div>
                  ))}
                  {items.length > 4 && (
                    <div style={{ fontSize: 9, color: C.textMid, paddingLeft: 4, fontWeight: 600 }}>
                      + {items.length - 4} más...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
         <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.bg, padding: "10px 16px", borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.textMid }}>Estados:</span>
            {Object.entries(ESTADOS).map(([key, cfg]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }}></div>
                <span style={{ fontSize: 11, color: C.textDark, fontWeight: 500 }}>{cfg.label}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  )
}
