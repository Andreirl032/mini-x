import type { SelectHTMLAttributes } from "react";
import { countriesByName } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountrySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function CountrySelect({
  label,
  error,
  className,
  id,
  ...props
}: CountrySelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={selectId}>
      <span className="text-sm font-semibold text-ink">{label}</span>
      <select
        id={selectId}
        className={cn(
          "h-11 rounded-xl border border-line bg-surface px-3 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className,
        )}
        {...props}
      >
        <option value="">Select a country</option>
        {countriesByName.map((country) => (
          <option key={country.sigla} value={country.sigla}>
            {country.nome_pais_int}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
