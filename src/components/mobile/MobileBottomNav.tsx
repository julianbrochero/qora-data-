import { Home, MoreHorizontal, Package, ShoppingCart } from "lucide-react";

export type MobileNavKey = "dashboard" | "pedidos" | "productos" | "mas";

type MobileBottomNavProps = {
  active: MobileNavKey;
  onChange: (next: MobileNavKey) => void;
  pendingSales?: number;
};

const tabs = [
  { key: "dashboard", label: "Inicio", icon: Home },
  { key: "pedidos", label: "Ventas", icon: ShoppingCart },
  { key: "productos", label: "Productos", icon: Package },
  { key: "mas", label: "Más", icon: MoreHorizontal },
] as const;

export default function MobileBottomNav({ active, onChange, pendingSales = 0 }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/98 shadow-[0_-4px_18px_rgba(15,23,42,0.06)] backdrop-blur md:hidden" style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}>
      <ul className="mx-auto flex h-[60px] max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <li key={tab.key} className="relative flex-1">
              <button
                type="button"
                onClick={() => onChange(tab.key)}
                className="relative flex h-[56px] w-full flex-col items-center justify-center rounded-xl border-0 bg-transparent outline-none transition focus-visible:ring-2 focus-visible:ring-[#1a5c45]/25"
              >
                {tab.key === "pedidos" && pendingSales > 0 ? (
                  <span className="absolute right-5 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {pendingSales > 9 ? "9+" : pendingSales}
                  </span>
                ) : null}
                <Icon className={isActive ? "h-6 w-6 text-[#1a5c45]" : "h-6 w-6 text-slate-400"} strokeWidth={isActive ? 2.3 : 2} />
                <span className={isActive ? "mt-0.5 text-[10px] font-semibold text-[#1a5c45]" : "mt-0.5 text-[10px] font-medium text-slate-500"}>{tab.label}</span>
                {isActive ? <span className="absolute bottom-1.5 h-1 w-5 rounded-full bg-[#1a5c45]" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
