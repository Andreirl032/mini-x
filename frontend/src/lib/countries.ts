import countryCodes from "../../country_codes.json";

export interface CountryEntry {
  gentilico: string;
  nome_pais: string;
  nome_pais_int: string;
  sigla: string;
}

const countries = countryCodes as CountryEntry[];

/** Sorted by English country name for UI selects. */
export const countriesByName = [...countries].sort((a, b) =>
  a.nome_pais_int.localeCompare(b.nome_pais_int, "en"),
);

export function codeFromCountryName(name: string): string | undefined {
  const match = countries.find(
    (country) =>
      country.nome_pais_int.toLowerCase() === name.toLowerCase() ||
      country.nome_pais.toLowerCase() === name.toLowerCase(),
  );
  return match?.sigla;
}

export function countryNameFromCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const match = countries.find(
    (country) => country.sigla.toUpperCase() === code.toUpperCase(),
  );
  return match?.nome_pais_int ?? code;
}
