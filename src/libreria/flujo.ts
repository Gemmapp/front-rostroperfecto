import type { Comprobante } from './datos/tipos'

// Comprobante de la ultima visita registrada (se muestra en /comprobante).
let ultimo: Comprobante | null = null
export const fijarComprobante = (r: Comprobante | null) => { ultimo = r }
export const obtenerComprobante = () => ultimo
