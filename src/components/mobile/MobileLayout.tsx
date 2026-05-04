import { Bell, Home, Package, ShoppingCart, Users, MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";

export type MobileTabKey = "inicio" | "ventas" | "productos" | "clientes" | "mas";

type MobileLayoutProps = {
  activeTab?: MobileTabKey;
  children: ReactNode;
  pendingSalesCount?: number;
  onTabChange?: (tab: MobileTabKey) => void;
};

type TabItem = {
  key: MobileTabKey;
  label: string;
  icon: typeof Home;
};

const tabs: TabItem[] = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "ventas", label: "Ventas", icon: ShoppingCart },
  { key: "productos", label: "Productos", icon: Package },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "mas", label: "Mas", icon: MoreHorizontal },
];

export default function MobileLayout({
  activeTab = "inicio",
  children,
  pendingSalesCount = 2,
  onTabChange,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:min-h-0 md:bg-transparent">
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-none md:px-0 md:pb-0 md:pt-0">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <ul className="mx-auto flex w-full max-w-md items-center justify-between gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <li key={tab.key} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => onTabChange?.(tab.key)}
                  className={[
                    "relative flex min-h-[52px] w-full flex-col items-center justify-center rounded-xl px-1 py-1.5 text-xs font-medium transition",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-100 active:scale-[0.98]",
                  ].join(" ")}
                >
                  {tab.key === "inicio" && pendingSalesCount > 0 ? (
                    <span className="absolute right-4 top-1.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                      {pendingSalesCount > 9 ? "9+" : pendingSalesCount}
                    </span>
                  ) : null}
                  <Icon className="mb-0.5 h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        className="fixed right-5 top-5 hidden h-11 min-w-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm md:inline-flex"
      >
        <Bell className="h-4 w-4" />
        Desktop intacto
      </button>
    </div>
  );
}
