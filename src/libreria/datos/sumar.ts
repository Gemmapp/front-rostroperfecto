import { ars, num } from '@/libreria/formato'
import type { Reglas, ServicioElemento } from './tipos'

/** "48 puntos ($480)": puntos primero y pesos entre parentesis (mismo formato en toda la app). */
export function puntosYPesos(puntos: number, pesos: number): string {
  return `${num(puntos)} ${puntos === 1 ? 'punto' : 'puntos'} (${ars(pesos)})`
}

/** Texto de lo que devuelve un servicio segun el modo de las reglas (los valores vienen de la API). */
export function sumarEtiqueta(s: Pick<ServicioElemento, 'sumar' | 'sumarPuntos'>, reglas?: Reglas | null): string {
  if (reglas?.devolucionModo === 'PUNTOS') {
    const pts = s.sumarPuntos ?? reglas.puntosPorServicio
    return `Suma ${puntosYPesos(pts, s.sumar)}`
  }
  return `Suma ${ars(s.sumar)}`
}
