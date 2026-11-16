import { crearApiOrigen } from './origen-api'
import { crearEjemploOrigen } from './ejemplo'
import type { DatosOrigen } from './tipos'

// NEXT_PUBLIC_DATA_SOURCE=sample usa solo datos de ejemplo (sin backend). Por defecto: API real.
let origen: DatosOrigen | null = null
export function obtenerOrigen(): DatosOrigen {
  if (!origen) origen = import.meta.env.VITE_DATA_SOURCE === 'sample' ? crearEjemploOrigen() : crearApiOrigen()
  return origen
}
/** Solo para tests. */
export function fijarOrigen(s: DatosOrigen | null) { origen = s }
export const isDemoIngresoHabilitado = import.meta.env.DEV
