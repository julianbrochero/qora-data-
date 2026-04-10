/**
 * DashboardNimbus.jsx — estética TiendaNube simplificada + TU INFO
 */
import { useState } from "react"
import { useAuth } from "../../lib/AuthContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import { MenuIcon, ChevronRightIcon, PlusIcon } from "@nimbus-ds/icons"
import {
  DollarSign, Package, Truck, Store,
  Info, BarChart2, ShoppingCart, FileText, CheckCircle2, Clock
} from "lucide-react"

/* ══════════════════════════════════════════
   TUS COLORES (Tomados de ProductosNimbus)
══════════════════════════════════════════ */
const C = {
  pageBg:    "#f8f9fb",
  bg:        "#ffffff",
  border:    "#d1d5db",
  borderMd:  "#9ca3af",
  primary:   "#334139",
  primaryHov:"#2b352f",
  primarySurf:"#eaf0eb",
  successTxt:"#065f46", successSurf:"#d1fae5", successBord:"#6ee7b7",
  warnTxt:   "#92400e", warnSurf:  "#fef3c7", warnBord:   "#fcd34d",
  dangerTxt: "#991b1b", dangerSurf:"#fee2e2", dangerBord: "#fca5a5",
  textBlack: "#0d0d0d",
  textDark:  "#111827",
  textMid:   "#6b7280",
  textLight: "#9ca3af",
}

const fmtMoney = (n) =>
  (parseFloat(n) || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) }
  catch { return "—" }
}

const RESPONSIVE = `
  .dn-show-mobile { display: none; }
  .dn-hide-mobile { display: flex; }
  
  .dn-top-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .dn-main-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    align-items: start;
    margin-bottom: 32px;
  }

  .dn-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: ${C.border};
    gap: 1px;
    border: 1px solid ${C.border};
    border-radius: 8px;
    overflow: hidden;
  }

  .dn-stat-cell {
    background: #fff;
    padding: 16px 20px;
  }

  @media (max-width: 900px) {
    .dn-show-mobile { display: flex !important; }
    .dn-hide-mobile { display: none !important; }
    
    .dn-top-cards {
      grid-template-columns: 1fr 1fr;
    }
    .dn-main-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 500px) {
    .dn-top-cards {
      grid-template-columns: 1fr;
    }
  }
`

/* ─── Top Status Card ─── */
const StatusCard = ({ icon: Icon, mainText, subText, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "16px",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      cursor: "pointer",
      transition: "border-color 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderMd}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
  >
    <div style={{ marginTop: 2 }}>
      <Icon size={16} color={active ? C.primary : C.textMid} />
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: active ? C.primary : C.textDark, fontFamily: "'Inter', sans-serif" }}>
        {mainText}
      </div>
      <div style={{ fontSize: 13, color: C.textMid, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
        {subText}
      </div>
    </div>
  </div>
)

/* ─── Tab Button ─── */
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 600,
      color: active ? C.primary : C.textDark,
      background: "none",
      border: "none",
      borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      marginBottom: -1,
    }}
  >
    {label}
  </button>
)

/* ─── List Row (Para últimas facturas/ventas/stock) ─── */
const ListRow = ({ title, sub, rightText, rightLabelBg, rightLabelColor, icon: Icon, onClick }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        background: hov ? "#fafafa" : "#fff",
        borderBottom: `1px solid ${C.border}`,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.1s"
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 6, background: C.primarySurf, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Icon size={14} color={C.primary} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: C.textMid }}>{sub}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.textBlack }}>{rightText}</div>
        {rightLabelBg && (
          <div style={{ padding: "1px 6px", borderRadius: 4, background: rightLabelBg, color: rightLabelColor, fontSize: 10, fontWeight: 700 }}>
            {rightLabelBg === C.successSurf ? "Pagado" : "Pendiente"}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Contenedor tipo Tarjeta Blanca ─── */
const CardShell = ({ title, actionLabel, onAction, children }) => (
  <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 24 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter', sans-serif" }}>
        {title}
      </div>
      {actionLabel && (
        <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: C.primary, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          {actionLabel} <ChevronRightIcon size={12} color={C.primary} />
        </button>
      )}
    </div>
    <div>{children}</div>
  </div>
)

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function DashboardNimbus({
  pedidos = [], productos = [],
  onViewAllPedidos, onViewAllProductos,
  onNuevaVenta, onOpenMobileSidebar
}) {
  const [tab, setTab] = useState("Hoy")

  const pedidosConSaldo    = pedidos.filter(p => parseFloat(p.saldo_pendiente) > 0.01)
  const pedidosEnCurso     = pedidos.filter(p => p.estado === "pendiente" || p.estado === "preparando" || p.estado === "enviado")
  const productosBajoStock = productos.filter(p => p.controlaStock && p.stock <= (p.stock_minimo || 5))

  // Pestañas (Hoy, Ayer, Esta semana)
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)

  const hoyStr = hoy.toISOString().split("T")[0]
  const ayerStr = ayer.toISOString().split("T")[0]
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  let pedidosFiltrados = []

  if (tab === "Hoy") {
    pedidosFiltrados = pedidos.filter(p => (p.created_at || p.fecha_pedido || "").split("T")[0] === hoyStr)
  } else if (tab === "Ayer") {
    pedidosFiltrados = pedidos.filter(p => (p.created_at || p.fecha_pedido || "").split("T")[0] === ayerStr)
  } else {
    // Este Mes
    pedidosFiltrados = pedidos.filter(p => new Date(p.created_at || p.fecha_pedido || 0) >= inicioMes)
  }

  const ventasCount = pedidosFiltrados.length
  const totalFacturacion = pedidosFiltrados.reduce((acc, p) => acc + parseFloat(p.total || 0), 0)
  const ticketPromedio = ventasCount > 0 ? (totalFacturacion / ventasCount) : 0

  const ultimospedidos  = [...pedidos].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 4)
  const pedidosDeuda    = [...pedidosConSaldo].sort((a, b) => (parseFloat(b.saldo_pendiente)||0) - (parseFloat(a.saldo_pendiente)||0)).slice(0, 4)

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, fontFamily: "'Inter', sans-serif" }}>
      <style>{RESPONSIVE}</style>

      {/* ── Mobile topbar ── */}
      <div className="dn-show-mobile" style={{
        alignItems: "center", gap: 10, padding: "11px 16px",
        background: C.bg, borderBottom: `1px solid ${C.border}`
      }}>
        <button onClick={onOpenMobileSidebar} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
          <MenuIcon size={20} color={C.textBlack} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: C.textBlack }}>Inicio</span>
        <button onClick={onNuevaVenta} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
          height: 32, padding: "0 18px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: C.primary, color: "#fff", border: "none", cursor: "pointer",
        }}>
          <PlusIcon size={13} color="#fff" /> Nueva venta
          <span style={{ marginLeft: 4, padding: "2px 5px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>Ctrl</span>
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", boxSizing: "border-box" }}>
        
        {/* Titulo Header Escritorio */}
        <div className="dn-hide-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter', sans-serif" }}>
            Inicio
          </h1>
          <button onClick={onNuevaVenta} style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 34, padding: "0 18px", borderRadius: 6,
            fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
            background: C.primary, color: "#fff", border: "none", cursor: "pointer"
          }}>
            Ingresar Venta
            <span style={{ marginLeft: 4, padding: "2px 5px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>Ctrl</span>
          </button>
        </div>

        {/* ── Top Status Cards (Usando tu lógica) ── */}
        <div className="dn-top-cards">
          <StatusCard
            icon={ShoppingCart}
            mainText={pedidosEnCurso.length === 0 ? "Sin ventas en curso" : `${pedidosEnCurso.length} ventas`}
            subText="Por procesar o entregar"
            active={pedidosEnCurso.length > 0}
            onClick={onViewAllPedidos}
          />
          <StatusCard
            icon={FileText}
            mainText={pedidosConSaldo.length === 0 ? "Todo al día" : `${pedidosConSaldo.length} ventas`}
            subText="Con saldo pendiente"
            active={pedidosConSaldo.length > 0}
            onClick={onViewAllPedidos}
          />
          <StatusCard
            icon={Package}
            mainText={productosBajoStock.length === 0 ? "Stock óptimo" : `${productosBajoStock.length} productos`}
            subText="Con stock bajo o en cero"
            active={productosBajoStock.length > 0}
            onClick={onViewAllProductos}
          />
          <StatusCard
            icon={Store}
            mainText={`${productos.length} items`}
            subText="Activos en tu catálogo"
            active={false}
            onClick={onViewAllProductos}
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="dn-main-grid">
          
          {/* Seccion Izquierda: Tab Stats & TUS Facturas/Pedidos */}
          <div>
            {/* Tabs (Mismo diseño TiendaNube) */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
              <Tab label="Hoy" active={tab === "Hoy"} onClick={() => setTab("Hoy")} />
              <Tab label="Ayer" active={tab === "Ayer"} onClick={() => setTab("Ayer")} />
              <Tab label="Este mes" active={tab === "Este mes"} onClick={() => setTab("Este mes")} />
            </div>

            {/* Stats Grid (Mantiene el layout de 2 columnas de la foto pero con TUS metricas reales) */}
            <div className="dn-stats-grid" style={{ marginBottom: 32 }}>
              <div className="dn-stat-cell">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.textMid, fontFamily: "'Inter', sans-serif" }}>Ventas totales</span>
                  <Info size={12} color={C.textLight} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
                  {ventasCount}
                </div>
              </div>
              
              <div className="dn-stat-cell">
                 <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.textMid, fontFamily: "'Inter', sans-serif" }}>Importe Total ({tab})</span>
                  <Info size={12} color={C.textLight} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
                  {fmtMoney(totalFacturacion)}
                </div>
              </div>

              <div className="dn-stat-cell" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.textMid, fontFamily: "'Inter', sans-serif" }}>Ticket promedio de venta</span>
                  <Info size={12} color={C.textLight} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
                  {fmtMoney(ticketPromedio)}
                </div>
              </div>
            </div>

            {/* Listas reales de FacturaPRO: Ultimas Ventas */}
            <CardShell title="Últimas ventas procesadas" actionLabel="Ver ventas" onAction={onViewAllPedidos}>
              {ultimospedidos.length > 0 ? ultimospedidos.map((p, i) => (
                 <ListRow 
                    key={p.id || i}
                    icon={ShoppingCart}
                    title={p.cliente_nombre || "Consumidor Final"}
                    sub={`#${p.codigo || p.id} - ${fmtDate(p.created_at)}`}
                    rightText={fmtMoney(p.total)}
                    onClick={onViewAllPedidos}
                 />
              )) : (
                <div style={{ padding: 20, textAlign: "center", color: C.textMid, fontSize: 13 }}>No hay ventas registradas aún.</div>
              )}
            </CardShell>

          </div>

          {/* Seccion Derecha: Saldos pendientes + Stock */}
          <div>
             <CardShell title="Saldos pendientes" actionLabel="Ver ventas" onAction={onViewAllPedidos}>
              {pedidosDeuda.length > 0 ? pedidosDeuda.map((p, i) => (
                 <ListRow
                    key={p.id || i}
                    icon={ShoppingCart}
                    title={p.cliente_nombre || p.cliente || "Consumidor Final"}
                    sub={p.codigo || `PED-${String(p.id || "").slice(0, 6)}`}
                    rightText={fmtMoney(parseFloat(p.saldo_pendiente) || 0)}
                    rightLabelBg={C.warnSurf}
                    rightLabelColor={C.warnTxt}
                    onClick={onViewAllPedidos}
                 />
              )) : (
                <div style={{ padding: 20, textAlign: "center", color: C.textMid, fontSize: 13 }}>Sin saldos pendientes.</div>
              )}
            </CardShell>

            <CardShell title="Alertas de Inventario" actionLabel="Ir a productos" onAction={onViewAllProductos}>
              {productosBajoStock.length > 0 ? productosBajoStock.slice(0, 4).map((p, i) => (
                 <ListRow 
                    key={p.id || i}
                    icon={Package}
                    title={p.nombre}
                    sub={p.categoria || "Sin categoría"}
                    rightText={`${p.stock} u.`}
                    rightLabelBg={p.stock <= 0 ? C.dangerSurf : C.warnSurf}
                    rightLabelColor={p.stock <= 0 ? C.dangerTxt : C.warnTxt}
                    onClick={onViewAllProductos}
                 />
              )) : (
                <div style={{ padding: 20, textAlign: "center", color: C.textMid, fontSize: 13 }}>
                  <CheckCircle2 size={32} color={C.successTxt} style={{ marginBottom: 10 }} />
                  <div>Stock en niveles óptimos.</div>
                </div>
              )}
            </CardShell>
          </div>

        </div>
      </div>
    </div>
  )
}
