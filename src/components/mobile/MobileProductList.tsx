import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
};

const products: Product[] = [
  { id: "p1", name: "Yerba Organica 500g", price: "$5.800", stock: 14 },
  { id: "p2", name: "Cafe de especialidad", price: "$8.200", stock: 2 },
  { id: "p3", name: "Taza termica 350ml", price: "$12.900", stock: 0 },
  { id: "p4", name: "Pack filtros x100", price: "$3.400", stock: 22 },
];

export default function MobileProductList() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => product.name.toLowerCase().includes(term));
  }, [query]);

  return (
    <section className="relative pb-24 md:hidden">
      <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h1 className="mb-3 text-xl font-semibold">Productos</h1>
        <label className="flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar producto"
            className="h-11 w-full border-none bg-transparent text-base outline-none placeholder:text-slate-400"
          />
        </label>
      </header>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <div className="mx-auto mb-3 h-16 w-16 rounded-2xl bg-slate-100" />
          <p className="text-sm text-slate-500">No encontramos productos para "{query}"</p>
          <button className="mt-4 min-h-[44px] rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">Agregar producto</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => {
            const lowStock = product.stock > 0 && product.stock <= 3;
            const outOfStock = product.stock === 0;

            return (
              <article key={product.id} className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-slate-200" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-sm font-bold text-slate-800">{product.price}</p>
                  {outOfStock ? (
                    <span className="mt-1 inline-flex rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">Sin stock</span>
                  ) : (
                    <p className={["text-xs", lowStock ? "font-semibold text-rose-600" : "text-slate-500"].join(" ")}>
                      Stock: {product.stock}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="fixed bottom-24 right-5 inline-flex h-14 min-w-[56px] items-center justify-center rounded-full bg-emerald-600 p-4 text-white shadow-lg transition hover:bg-emerald-700 md:hidden"
        aria-label="Agregar producto"
      >
        <Plus className="h-6 w-6" />
      </button>
    </section>
  );
}
