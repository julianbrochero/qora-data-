"use client"

import { useState } from "react"
import {
  DollarSign,
  FileText,
  Users,
  CreditCard,
  TrendingUp,
  Package,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  UserPlus,
  PackagePlus,
  FileBarChart,
  Truck,
  Clock,
} from "lucide-react"

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-2 px-3 py-1.5 bg-[#2b2b2b] hover:bg-[#3b3b3b] border border-[#3b3b3b] rounded-lg transition-all duration-200 hover:shadow-lg text-white text-xs"
  >
    <Icon size={12} className="text-white" />
    <span className="font-medium">{label}</span>
  </button>
)

const MetricCard = ({ title, value, subtitle, icon: Icon, change, period = "vs mes anterior" }) => (
  <div className="bg-white border border-gray-300 shadow-sm p-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-h-[110px] flex flex-col justify-between relative overflow-hidden">
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2b2b2b]/5 to-transparent rounded-full blur-xl" />

    <div className="flex items-start justify-between relative z-10">
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="p-1.5 rounded-full flex-shrink-0 transition-transform duration-200 bg-[#2b2b2b]/10 border border-[#2b2b2b]/20">
            <Icon size={12} className="text-[#2b2b2b]" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 leading-tight">{title}</h3>
        </div>
        <p className="text-base font-bold text-gray-900 mb-0.5">{value}</p>
      </div>
    </div>

    <div className="mt-1 relative z-10">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{subtitle}</p>
        {change && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${change > 0 ? "text-green-600" : "text-red-600"
              }`}
          >
            {change > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      {change && <p className="text-[10px] text-gray-400 text-right mt-0.5">{period}</p>}
    </div>
  </div>
)

const SimpleChart = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="mt-3">
      <div className="flex items-end justify-between h-16 gap-0.5">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t-sm transition-all duration-300 hover:opacity-90 relative group cursor-pointer"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                background: "linear-gradient(180deg, #2b2b2b 0%, #4b4b4b 100%)",
              }}
              title={`${item.label}: $${item.value.toLocaleString()}`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <div className="bg-white px-2 py-1 rounded border border-[#2b2b2b]/30 whitespace-nowrap shadow-xs">
                  <div className="text-xs text-gray-600">${item.value.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <span className="text-xs mt-1 text-gray-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const UltimasFacturas = ({ facturas, onViewAll }) => {
  const [filter, setFilter] = useState("all")

  const filteredFacturas = facturas
    .filter((f) => {
      if (filter === "all") return true
      if (filter === "pending") return f.estado !== "Pagada" && f.estado !== "pagada"
      if (filter === "paid") return f.estado === "Pagada" || f.estado === "pagada"
      return true
    })
    .slice(0, 4)

  return (
    <div className="bg-white border border-gray-300 shadow-sm p-3 rounded-xl transition-shadow duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Últimas Facturas</h3>
          <p className="text-xs text-gray-500 mt-0.5">{facturas.length} facturas total</p>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            className="text-xs px-2 py-1 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2b2b2b] focus:border-[#2b2b2b]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagadas</option>
          </select>
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-[#2b2b2b] hover:text-[#2b2b2b]/80 text-xs font-medium transition-all px-2 py-1 rounded-lg hover:bg-[#2b2b2b]/10"
          >
            Ver <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredFacturas.length > 0 ? (
          filteredFacturas.map((factura, index) => (
            <div
              key={factura.id}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm hover:border-[#2b2b2b]/30 bg-gray-50/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#2b2b2b]/10 border border-[#2b2b2b]/20">
                  <FileText size={12} className="text-[#2b2b2b]" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs text-gray-900 truncate">
                    {factura.numero || `FAC-${factura.id}`}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{factura.cliente}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                <p className="font-semibold text-xs text-gray-900">
                  ${typeof factura.total === "number" ? factura.total.toLocaleString() : "0"}
                </p>
                <span
                  className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 ${factura.estado === "Pagada" || factura.estado === "pagada"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : factura.estado === "pendiente"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      : factura.estado === "parcial"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                >
                  {factura.estado?.charAt(0).toUpperCase() || "P"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <FileText size={18} className="mx-auto mb-1 opacity-50" />
            <p className="text-xs">No hay facturas</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ProductosStockBajo = ({ productos, onViewAll }) => {
  const productosBajoStock = productos.filter((p) => p.stock < (p.stockMinimo || 5)).slice(0, 4)

  const getStockLevel = (stock) => {
    if (stock === 0) return { label: "Agotado", color: "text-red-600", bg: "bg-red-100" }
    if (stock <= 2) return { label: "Muy Bajo", color: "text-orange-600", bg: "bg-orange-100" }
    return { label: "Bajo", color: "text-yellow-600", bg: "bg-yellow-100" }
  }

  return (
    <div className="bg-white border border-gray-300 shadow-sm p-3 rounded-xl h-full transition-shadow duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Stock Bajo</h3>
          <p className="text-xs text-gray-500 mt-0.5">{productosBajoStock.length} productos</p>
        </div>
        {productosBajoStock.length > 0 && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-[#2b2b2b] hover:text-[#2b2b2b]/80 text-xs font-medium transition-all px-2 py-1 rounded-lg hover:bg-[#2b2b2b]/10"
          >
            Ver <ChevronRight size={12} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {productosBajoStock.length > 0 ? (
          productosBajoStock.map((producto, index) => {
            const stockLevel = getStockLevel(producto.stock)

            return (
              <div
                key={producto.id}
                className="flex items-center justify-between p-2 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm hover:border-[#2b2b2b]/30 bg-gray-50/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${stockLevel.bg} border border-current/20`}>
                    {producto.stock === 0 ? (
                      <AlertCircle size={12} className={stockLevel.color} />
                    ) : (
                      <Package size={12} className={stockLevel.color} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-gray-900 truncate">{producto.nombre}</p>
                    <p className="text-xs text-gray-500">Stock: {producto.stock}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  {producto.precio && (
                    <p className="font-semibold text-xs text-gray-900">
                      ${typeof producto.precio === "number" ? producto.precio.toLocaleString() : "0"}
                    </p>
                  )}
                  <p className={`text-xs ${stockLevel.color} mt-0.5 font-medium`}>{stockLevel.label}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4 text-gray-500">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mb-2 border border-green-200">
              <CheckCircle className="text-green-600" size={16} />
            </div>
            <p className="text-xs">Todo en orden</p>
          </div>
        )}
      </div>
    </div>
  )
}

const PedidosPendientes = ({ pedidos, onViewAll }) => {
  const pedidosPendientes = pedidos.filter(p =>
    p.estado === "pendiente"
  ).slice(0, 3)

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente": return "bg-yellow-100 text-yellow-800"
      case "enviado": return "bg-purple-100 text-purple-800"
      case "entregado": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short"
      })
    } catch {
      return ""
    }
  }

  return (
    <div className="bg-white border border-gray-300 shadow-sm p-3 rounded-xl h-full transition-shadow duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Pedidos Pendientes</h3>
          <p className="text-xs text-gray-500 mt-0.5">{pedidosPendientes.length} por entregar</p>
        </div>
        {pedidosPendientes.length > 0 && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-[#2b2b2b] hover:text-[#2b2b2b]/80 text-xs font-medium transition-all px-2 py-1 rounded-lg hover:bg-[#2b2b2b]/10"
          >
            Ver <ChevronRight size={12} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {pedidosPendientes.length > 0 ? (
          pedidosPendientes.map((pedido) => (
            <div
              key={pedido.id}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm hover:border-[#2b2b2b]/30 bg-gray-50/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg ${getEstadoColor(pedido.estado)}`}>
                  {pedido.estado === "pendiente" ? (
                    <Clock size={12} />
                  ) : (
                    <Truck size={12} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs text-gray-900 truncate">
                    {pedido.codigo || "PED-" + pedido.id.slice(0, 4)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{pedido.cliente_nombre}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                <p className="font-semibold text-xs text-gray-900">
                  ${typeof pedido.total === "number" ? pedido.total.toLocaleString() : "0"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatearFecha(pedido.fecha_entrega_estimada)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mb-2 border border-green-200">
              <CheckCircle className="text-green-600" size={16} />
            </div>
            <p className="text-xs">No hay pedidos pendientes</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ResumenVentas = ({ facturas }) => {
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const inicioAnteriorMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const finAnteriorMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0)

  const facturasEsteMes = facturas.filter((f) => {
    if (!f.fecha) return false
    const fechaFactura = new Date(f.fecha)
    return fechaFactura >= inicioMes && fechaFactura <= hoy
  })

  const facturasMesAnterior = facturas.filter((f) => {
    if (!f.fecha) return false
    const fechaFactura = new Date(f.fecha)
    return fechaFactura >= inicioAnteriorMes && fechaFactura <= finAnteriorMes
  })

  const totalEsteMes = facturasEsteMes.reduce((sum, f) => sum + (f.total || 0), 0)
  const totalMesAnterior = facturasMesAnterior.reduce((sum, f) => sum + (f.total || 0), 0)

  const cambioPorcentaje =
    totalMesAnterior > 0
      ? (((totalEsteMes - totalMesAnterior) / totalMesAnterior) * 100).toFixed(1)
      : totalEsteMes > 0
        ? 100
        : 0

  const datosVentas = [
    { label: "L", value: Math.floor(Math.random() * 5000) + 1000 },
    { label: "M", value: Math.floor(Math.random() * 5000) + 1000 },
    { label: "M", value: Math.floor(Math.random() * 5000) + 1000 },
    { label: "J", value: Math.floor(Math.random() * 5000) + 1000 },
    { label: "V", value: Math.floor(Math.random() * 5000) + 1000 },
    { label: "S", value: Math.floor(Math.random() * 3000) + 500 },
    { label: "D", value: Math.floor(Math.random() * 2000) + 500 },
  ]

  return (
    <div className="bg-white border border-gray-300 shadow-sm p-3 rounded-xl transition-shadow duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Resumen de Ventas</h3>
          <p className="text-xs text-gray-500 mt-0.5">Este mes vs mes anterior</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">${totalEsteMes.toLocaleString()}</p>
          <div
            className={`flex items-center gap-0.5 text-xs font-medium mt-1 ${cambioPorcentaje >= 0 ? "text-green-600" : "text-red-600"
              }`}
          >
            {cambioPorcentaje >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(Number.parseFloat(cambioPorcentaje))}%</span>
          </div>
        </div>
      </div>

      <SimpleChart data={datosVentas} />

      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Facturas mes</p>
          <p className="text-sm font-semibold mt-0.5 text-gray-900">{facturasEsteMes.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ticket promedio</p>
          <p className="text-sm font-semibold mt-0.5 text-gray-900">
            ${facturasEsteMes.length > 0 ? Math.floor(totalEsteMes / facturasEsteMes.length).toLocaleString() : "0"}
          </p>
        </div>
      </div>
    </div>
  )
}

const Dashboard = ({
  clientes = [],
  productos = [],
  facturas = [],
  pedidos = [],
  caja = {},
  onViewAllFacturas,
  onViewAllProductos,
  onViewAllPedidos,
  openModal
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const facturasEsteMes = facturas.filter((f) => {
    if (!f.fecha) return false
    const fechaFactura = new Date(f.fecha)
    return fechaFactura >= inicioMes
  })

  const ventasDelMes = facturasEsteMes.reduce((sum, f) => sum + (f.total || 0), 0)
  const facturasPendientes = facturas.filter((f) =>
    f.estado === "pendiente" || f.estado === "parcial"
  ).length
  const productosStockBajo = productos.filter((p) => p.stock < (p.stockMinimo || 5))

  const pedidosPendientes = pedidos.filter(p =>
    p.estado === "pendiente"
  ).length
  const pedidosHoy = pedidos.filter(p =>
    new Date(p.fecha_pedido).toDateString() === hoy.toDateString()
  ).length

  const cambios = {
    ventas: 12.5,
    facturas: -2.3,
    clientes: 5.7,
    caja: 8.9,
    pedidos: 15.2
  }

  const handleNuevaFactura = () => {
    if (openModal) {
      openModal('nueva-factura');
    }
  };

  const handleNuevoCliente = () => {
    if (openModal) {
      openModal('nuevo-cliente');
    }
  };

  const handleNuevoProducto = () => {
    if (openModal) {
      openModal('nuevo-producto');
    }
  };

  // ✅ CORREGIDO: Ahora abre el modal 'nueva-venta'
  const handleNuevoPedido = () => {
    if (openModal) {
      openModal('nueva-venta');
    }
  };

  const handleVerReportes = () => {
    console.log("Navegar a reportes");
  };

  return (
    <div className="space-y-3">
      {/* HEADER - Tamaño ajustado */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {hoy.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* BOTONES DE ACCIÓN RÁPIDA - Tamaño ajustado */}
        <div className="flex gap-1.5">
          <QuickActionButton
            icon={Plus}
            label="Nueva Venta"
            onClick={handleNuevoPedido}
          />
          <QuickActionButton
            icon={UserPlus}
            label="Nuevo Cliente"
            onClick={handleNuevoCliente}
          />
          <QuickActionButton
            icon={PackagePlus}
            label="Añadir Producto"
            onClick={handleNuevoProducto}
          />
          <QuickActionButton
            icon={FileBarChart}
            label="Reportes"
            onClick={handleVerReportes}
          />
        </div>
      </div>

      {/* CARDS DE MÉTRICAS - Tamaño ajustado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <MetricCard
          title="Ventas del Mes"
          value={`$${ventasDelMes.toLocaleString()}`}
          subtitle={`${facturasEsteMes.length} facturas`}
          icon={DollarSign}
          change={cambios.ventas}
          period="vs mes anterior"
        />

        <MetricCard
          title="Facturas Pendientes"
          value={facturasPendientes}
          subtitle={`de ${facturas.length} total`}
          icon={FileText}
          change={cambios.facturas}
          period="vs mes anterior"
        />

        <MetricCard
          title="Pedidos Pendientes"
          value={pedidosPendientes}
          subtitle={`${pedidosHoy} hoy`}
          icon={Truck}
          change={cambios.pedidos}
          period="vs ayer"
        />

        <MetricCard
          title="Clientes Registrados"
          value={clientes.length}
          subtitle="Total en el sistema"
          icon={Users}
          change={cambios.clientes}
          period="vs mes anterior"
        />

        <MetricCard
          title="Saldo de Caja"
          value={`$${caja.saldo?.toLocaleString() || "0"}`}
          subtitle={`Ingresos: $${caja.ingresos?.toLocaleString() || "0"}`}
          icon={CreditCard}
          change={cambios.caja}
          period="vs mes anterior"
        />
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2">
          <ResumenVentas facturas={facturas} />
        </div>

        <div className="space-y-2">
          <div className="bg-white border border-gray-300 shadow-sm p-3 rounded-xl transition-shadow duration-300 hover:shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-900">Estado de Caja</h4>
              <CreditCard size={12} className="text-[#2b2b2b]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Ingresos:</span>
                <span className="font-medium text-green-600 text-xs">${caja.ingresos?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Egresos:</span>
                <span className="font-medium text-red-600 text-xs">${caja.egresos?.toLocaleString() || "0"}</span>
              </div>
              <div className="pt-1.5 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-900">Saldo Total:</span>
                  <span className="font-bold text-sm text-gray-900">${caja.saldo?.toLocaleString() || "0"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-300 shadow-sm p-3 rounded-xl transition-shadow duration-300 hover:shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-900">Productos Totales</h4>
              <Package size={12} className="text-[#2b2b2b]" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">{productos.length}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <AlertCircle size={10} />
              <span>{productosStockBajo.length} con stock bajo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ÚLTIMAS FACTURAS, PEDIDOS PENDIENTES Y STOCK BAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-1">
          <UltimasFacturas facturas={facturas} onViewAll={onViewAllFacturas} />
        </div>

        <div className="lg:col-span-1">
          <PedidosPendientes pedidos={pedidos} onViewAll={onViewAllPedidos} />
        </div>

        <div className="lg:col-span-1">
          <ProductosStockBajo productos={productos} onViewAll={onViewAllProductos} />
        </div>
      </div>

      {/* FOOTER - Tamaño ajustado */}
      <div className="text-center text-xs text-gray-500">
        <p>
          Última actualización:{" "}
          {new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}

export default Dashboard