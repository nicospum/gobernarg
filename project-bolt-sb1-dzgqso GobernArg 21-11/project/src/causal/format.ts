/**
 * Números para el jugador en formato argentino (glosario, traído de la
 * versión A): punto de miles, coma decimal y signo menos tipográfico. La caja
 * se muestra como en la A Lite, en millones de pesos ("$2.000 M"): el motor
 * sigue contando unidades de juego y 1 unidad = $1 M (solo cambia el formato).
 */
const MINUS = '−';
const NBSP = ' ';

/** 1234.56 → "1.234,6"; -3 → "−3". */
export function fmtNum(n: number, decimals = 1): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const trimmedDec = dec?.replace(/0+$/, '');
  const body = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (trimmedDec ? `,${trimmedDec}` : '');
  return (n < 0 && Number(fixed) !== 0 ? MINUS : '') + body;
}

/** Monto de caja en millones, sin decimales: 1300 → "$1.300 M"; -27,4 → "−$27 M". */
export function fmtMoney(n: number): string {
  const rounded = Math.round(n);
  return `${rounded < 0 ? MINUS : ''}$${fmtNum(Math.abs(rounded), 0)}${NBSP}M`;
}

/** Variación de caja con signo: "+$250 M", "−$50 M", "$0 M". */
export function fmtMoneyDelta(n: number): string {
  return Math.round(n) > 0 ? `+${fmtMoney(n)}` : fmtMoney(n);
}

/** Porcentaje con un decimal: 38.12 → "38,1 %". */
export const fmtPct = (n: number, decimals = 1) => `${fmtNum(n, decimals)}${NBSP}%`;

/** Variación con signo: +2,5 / −1 / 0. */
export function fmtSigned(n: number, decimals = 1): string {
  const r = Number(n.toFixed(decimals));
  if (r === 0) return '0';
  return (r > 0 ? '+' : '') + fmtNum(r, decimals);
}

/** Valor de un indicador (escala 0-100): siempre con un decimal, "57,3". */
export const fmtScore = (n: number) => {
  const fixed = Math.abs(n).toFixed(1).replace('.', ',');
  return (n < 0 && Number(n.toFixed(1)) !== 0 ? MINUS : '') + fixed;
};
