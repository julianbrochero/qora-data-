import { ArrowUpRight, CreditCard, Package, ReceiptText, ShoppingBag } from "lucide-react";

type Metric = {
  label: string;
  value: string;
  trend: string;
};

type SaleItem = {
  id: string;
  customer: string;
  amount: string;
  status: "Pagado" | "Pendiente" | "Entregado";
  timeAgo: string;
};

const metrics: Metric[] = [
  { label: "Ventas hoy", value: "18", trend: "+12%" },
  { label: "Importe", value: "$324.500", trend: "+8%" },
  { label: "Ticket promedio", value: "$18.028", trend: "+5%" },
];

const quickActions = [
  { label: "Nueva venta", icon: ShoppingBag },
  { label: "Ver ventas", icon: ReceiptText },
  { label: "Productos", icon: Package },
  { label: "Caja", icon: CreditCard },
];

const recentSales: SaleItem[] = [
  { id: "V-1203", customer: "Camila Rojas", amount: "$45.000", status: "Pendiente", timeAgo: "hace 2h" },
  { id: "V-1202", customer: "Pedro Sosa", amount: "$12.300", status: "Pagado", timeAgo: "hace 3h" },
  { id: "V-1201", customer: "Luis Diaz", amount: "$7.900", status: "Entregado", timeAgo: "hace 5h" },
  { id: "V-1200", customer: "Ana Vera", amount: "$21.400", status: "Pagado", timeAgo: "hace 8h" },
];

const statusClass: Record<SaleItem["status"], string> = {
  Pagado: "bg-emerald-100 text-emerald-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Entregado: "bg-sky-100 text-sky-700",
};

export default function MobileDashboard() {
  return (
    <section className="space-y-5 md:hidden">
      <header className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Hola, Martina</p>
          <h1 className="text-xl font-semibold">Sabado, 2 de mayo</h1>
        </div>
        <button className="min-h-[48px] w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700">
          Nueva venta
        </button>
      </header>

      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
        {metrics.map((metric) => (
          <article key={metric.label} className="min-w-[170px] snap-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight">{metric.value}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {metric.trend}
            </p>
          </article>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Acciones rapidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex min-h-[88px] flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <Icon className="h-6 w-6 text-emerald-700" />
                <span className="text-sm font-semibold text-slate-800">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Ultimas ventas</h2>
        <div className="space-y-2">
          {recentSales.slice(0, 4).map((sale) => (
            <article key={sale.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {sale.customer.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{sale.customer}</p>
                  <p className="text-xs text-slate-500">{sale.timeAgo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{sale.amount}</p>
                <span className={["mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold", statusClass[sale.status]].join(" ")}>
                  {sale.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
