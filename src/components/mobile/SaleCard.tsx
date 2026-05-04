import { ChevronRight } from "lucide-react";

type SaleBadge = {
  label: string;
  className: string;
};

type SaleCardProps = {
  code: string;
  customer: string;
  amount: string;
  relativeDate: string;
  badges: SaleBadge[];
  onClick?: () => void;
};

export default function SaleCard({ code, customer, amount, relativeDate, badges, onClick }: SaleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border-t border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-semibold leading-5 text-slate-900">{code}</p>
        <p className="shrink-0 text-[19px] font-bold leading-5 text-slate-900">{amount}</p>
      </div>
      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="min-w-0 text-[14px] leading-5 text-slate-700">{customer}</p>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {badges.map((badge) => (
            <span key={badge.label} className={["rounded-full px-2 py-1 text-[10px] font-semibold", badge.className].join(" ")}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[12px] text-slate-500">
        <span>{relativeDate}</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
}
