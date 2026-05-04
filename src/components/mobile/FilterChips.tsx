import { useMemo } from "react";

type FilterChipsProps = {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  className?: string;
};

export default function FilterChips({ options, selected, onSelect, className = "" }: FilterChipsProps) {
  const uniq = useMemo(() => Array.from(new Set(options)), [options]);

  return (
    <div
      className={["flex gap-1.5 overflow-x-auto", className].join(" ")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {uniq.map((option) => {
        const active = option === selected;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="min-h-[36px] shrink-0 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition"
            style={{
              background: active ? "#1a5c45" : "#ffffff",
              borderColor: active ? "#1a5c45" : "#e5e7eb",
              color: active ? "#ffffff" : "#4b5563",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
