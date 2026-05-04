import { Loader2, RefreshCcw, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";

type SaleStatus = "Pagado" | "Pendiente" | "Entregado";

type Sale = {
  id: string;
  customer: string;
  amount: string;
  number: string;
  status: SaleStatus;
  timeAgo: string;
};

const filters = ["Todas", "Hoy", "Esta semana", "Pendientes"] as const;

const salesData: Sale[] = [
  { id: "1", customer: "Camila Rojas", amount: "$45.000", number: "#V-1203", status: "Pendiente", timeAgo: "hace 2h" },
  { id: "2", customer: "Pedro Sosa", amount: "$12.300", number: "#V-1202", status: "Pagado", timeAgo: "hace 3h" },
  { id: "3", customer: "Ana Vera", amount: "$21.400", number: "#V-1201", status: "Entregado", timeAgo: "hace 5h" },
  { id: "4", customer: "Juan Perez", amount: "$8.900", number: "#V-1200", status: "Pendiente", timeAgo: "hace 7h" },
];

const statusClass: Record<SaleStatus, string> = {
  Pagado: "bg-emerald-100 text-emerald-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Entregado: "bg-sky-100 text-sky-700",
};

export default function MobileSalesList() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todas");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSales = useMemo(() => {
    if (activeFilter === "Pendientes") return salesData.filter((sale) => sale.status === "Pendiente");
    return salesData;
  }, [activeFilter]);

  return (
    <section className="relative space-y-4 pb-24 md:hidden">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Ventas</h1>
        <p className="text-sm text-slate-500">Desliza para refrescar o usa el boton</p>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={[
              "min-h-[44px] whitespace-nowrap rounded-full border px-4 text-sm font-medium transition",
              activeFilter === filter
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 p-3 text-xs text-slate-500">
        Pull-to-refresh visual: arrastra la lista hacia abajo en mobile.
        <button
          type="button"
          onClick={() => {
            setIsRefreshing(true);
            setTimeout(() => setIsRefreshing(false), 900);
          }}
          className="ml-2 inline-flex min-h-[36px] items-center gap-1 rounded-md bg-white px-2 text-slate-700"
        >
          {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />} Refrescar
        </button>
      </div>

      {filteredSales.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-500">No hay ventas en este filtro</p>
          <button className="mt-4 min-h-[44px] rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">Crear venta</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <article key={sale.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{sale.customer}</p>
                  <p className="text-xs text-slate-500">{sale.number}</p>
                </div>
                <span className={["rounded-full px-2.5 py-1 text-[11px] font-semibold", statusClass[sale.status]].join(" ")}>
                  {sale.status}
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-2xl font-bold tracking-tight">{sale.amount}</p>
                <p className="text-xs text-slate-500">{sale.timeAgo}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        className="fixed bottom-24 right-5 inline-flex h-14 min-w-[56px] items-center justify-center rounded-full bg-emerald-600 p-4 text-white shadow-lg transition hover:bg-emerald-700 md:hidden"
        aria-label="Nueva venta"
      >
        <ShoppingBag className="h-6 w-6" />
      </button>
    </section>
  );
}
