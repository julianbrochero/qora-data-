type SaleItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

const items: SaleItem[] = [
  { id: "i1", name: "Yerba Organica 500g", quantity: 2, unitPrice: 5800 },
  { id: "i2", name: "Taza termica 350ml", quantity: 1, unitPrice: 12900 },
  { id: "i3", name: "Pack filtros x100", quantity: 3, unitPrice: 3400 },
];

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export default function MobileSaleDetail() {
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <section className="space-y-4 pb-36 md:hidden">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Venta</p>
            <h1 className="text-xl font-semibold">#V-1203</h1>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Pendiente</span>
        </div>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Cliente</p>
        <p className="mt-1 text-sm font-semibold">Camila Rojas</p>
        <p className="text-sm text-slate-500">+54 11 5555-8899</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">Items</p>
        <ul className="space-y-3">
          {items.map((item) => {
            const subtotal = item.quantity * item.unitPrice;
            return (
              <li key={item.id} className="rounded-xl border border-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.quantity} x {currency(item.unitPrice)} = <span className="font-semibold text-slate-900">{currency(subtotal)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </article>

      <footer className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Total</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-800">{currency(total)}</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-md gap-2">
          <button className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">Marcar como pagado</button>
          <button className="min-h-[48px] flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">Editar</button>
        </div>
      </div>
    </section>
  );
}
