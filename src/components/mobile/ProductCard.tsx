type ProductCardProps = {
  name: string;
  price: string;
  stockLabel: string;
  stockTone?: "muted" | "danger" | "warning";
  imageUrl?: string;
  onClick?: () => void;
};

const stockColor = {
  muted: "#6b7280",
  danger: "#A32D2D",
  warning: "#B45309",
};

export default function ProductCard({
  name,
  price,
  stockLabel,
  stockTone = "muted",
  imageUrl,
  onClick,
}: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[68px] min-h-[60px] w-full shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-3 py-2.5 text-left transition hover:bg-slate-50"
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[14px] font-semibold text-slate-900"
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.3,
          }}
        >
          {name}
        </p>
        <p className="mt-0.5 text-[13px] text-slate-500">
          <span className="font-bold text-slate-900">{price}</span>
          <span className="mx-1.5">•</span>
          <span style={{ color: stockColor[stockTone] }}>{stockLabel}</span>
        </p>
      </div>

      <span className="shrink-0 text-xl leading-none text-slate-400">›</span>
    </button>
  );
}
