import type { CSSProperties } from 'react'

/** Marca blanca: un unico hue (0-360). Los tokens --primary, --primary-text y --accent-soft se derivan en CSS (claro y oscuro). */
export function marcaEstilo(tono: number): CSSProperties {
  return { ['--brand-hue' as string]: tono }
}
export const avatarColor = (tono = 350) => `oklch(0.8 0.08 ${tono})`

/** Hue OKLCH (0-360) de un color de acento: acepta "oklch(L C H)" o hex (#RRGGBB). Por defecto 350 (rosa). */
export function tonoDesdeColor(color?: string | null, respaldo = 350): number {
  if (!color) return respaldo
  const ok = /^oklch\(\s*[\d.]+%?\s+[\d.]+\s+([\d.]+)/i.exec(color.trim())
  if (ok) return Math.round(Number(ok[1]) % 360)
  const hx = /^#([0-9a-f]{6})$/i.exec(color.trim())
  if (!hx) return respaldo
  const lin = (c: number) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }
  const n = parseInt(hx[1], 16)
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s2 = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s2
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s2
  if (Math.hypot(A, B) < 0.01) return respaldo
  return Math.round(((Math.atan2(B, A) * 180) / Math.PI + 360) % 360)
}
