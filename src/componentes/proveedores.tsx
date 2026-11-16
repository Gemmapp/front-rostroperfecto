import { useEffect, type ReactNode } from 'react'
import { SesionProveedor } from '@/libreria/sesion'

const TemaClave = 'fidelapp.theme'
export const obtenerTema = (): 'light' | 'dark' => {
  try { return localStorage.getItem(TemaClave) === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}
export function aplicarTema(t: 'light' | 'dark') {
  document.documentElement.dataset.theme = t
  try { localStorage.setItem(TemaClave, t) } catch { /* preferencia opcional */ }
}

/** Tema claro por defecto; el oscuro es opt-in (no sigue al sistema). */
export function Proveedores({ children }: { children: ReactNode }) {
  useEffect(() => { document.documentElement.dataset.theme = obtenerTema() }, [])
  return <SesionProveedor>{children}</SesionProveedor>
}
