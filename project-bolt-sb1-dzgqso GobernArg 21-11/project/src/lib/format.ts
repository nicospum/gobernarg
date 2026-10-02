/** Signo menos tipográfico (no el guion). */
const MINUS = "\u2212";
/** Espacio que no se corta: "$250 M" nunca queda partido en dos renglones. */
const NBSP = "\u00A0";

/** Punto de miles sobre los dígitos de un entero: "2200" → "2.200". */
function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Entero con punto de miles: 2200 → "2.200". */
function thousands(n: number): string {
  return groupThousands(String(Math.round(Math.abs(n))));
}

/**
 * Monto de la caja en millones, en formato argentino (glosario):
 * 2200 → "$2.200 M", 250 → "$250 M", -50 → "−$50 M".
 */
export function fmtBudget(n: number): string {
  const sign = Math.round(n) < 0 ? MINUS : "";
  return `${sign}$${thousands(n)}${NBSP}M`;
}

/** Variación de caja, siempre con signo: "+$250 M", "−$50 M", "$0 M". */
export function fmtBudgetDelta(n: number): string {
  if (Math.round(n) === 0) return `$0${NBSP}M`;
  return n > 0 ? `+${fmtBudget(n)}` : fmtBudget(n);
}

/** Número con coma decimal: 57.6 → "57,6". */
export function fmtNumber(n: number, decimals = 0): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const body = groupThousands(int) + (dec ? `,${dec}` : "");
  return (n < 0 && Number(fixed) !== 0 ? MINUS : "") + body;
}

/** Porcentaje: 57.6 → "57,6 %" (un decimal solo donde hace falta, p. ej. elecciones). */
export function fmtPct(n: number, decimals = 0): string {
  return `${fmtNumber(n, decimals)}${NBSP}%`;
}
