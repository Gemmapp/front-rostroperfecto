// Sesion del personal. El token vive en memoria y se replica en sessionStorage para sobrevivir a una recarga.
// Riesgo: sessionStorage es legible por cualquier script de la pagina (XSS). El token dura 4 horas y se renueva solo
// mientras el usuario esta activo (ver el efecto de renovacion); una pestaña sin uso deja vencer la sesion.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/libreria/api/peticiones'
import { configurarHttp } from '@/libreria/api/http'
import type { Sesion } from '@/libreria/datos/tipos'

const Clave = 'fidelapp.session'
let memoriaToken: string | null = null
configurarHttp({ personalToken: () => memoriaToken })

function leer(): Sesion | null {
  try { const crudo = sessionStorage.getItem(Clave); return crudo ? (JSON.parse(crudo) as Sesion) : null } catch { return null }
}

interface Ctx { sesion: Sesion | null; listo: boolean; firmarIn: (s: Sesion) => void; firmarSalida: () => void; actualizar: (p: Partial<Sesion>) => void }
const SesionCtx = createContext<Ctx | null>(null)

export function SesionProveedor({ children }: { children: ReactNode }) {
  const [sesion, fijarSesion] = useState<Sesion | null>(null)
  const [listo, fijarListo] = useState(false)
  useEffect(() => {
    const s = leer()
    memoriaToken = s?.token ?? null
    fijarSesion(s)
    fijarListo(true)
  }, [])
  const firmarIn = useCallback((s: Sesion) => {
    memoriaToken = s.token
    try { sessionStorage.setItem(Clave, JSON.stringify(s)) } catch { /* sin storage */ }
    fijarSesion(s)
  }, [])
  const firmarSalida = useCallback(() => {
    memoriaToken = null
    try { sessionStorage.removeItem(Clave) } catch { /* sin storage */ }
    fijarSesion(null)
  }, [])
  const actualizar = useCallback((p: Partial<Sesion>) => {
    fijarSesion((actual) => {
      if (!actual) return actual
      const siguiente = { ...actual, ...p }
      try { sessionStorage.setItem(Clave, JSON.stringify(siguiente)) } catch { /* sin storage */ }
      return siguiente
    })
  }, [])
  // Renovacion: cada minuto, si el token vence en menos de 1 hora y hubo actividad en los ultimos 20 minutos, pide uno nuevo.
  useEffect(() => {
    let ultimo = Date.now()
    const tocar = () => { ultimo = Date.now() }
    const evs = ['pointerdown', 'keydown', 'scroll'] as const
    evs.forEach((e) => window.addEventListener(e, tocar, { passive: true }))
    const t = setInterval(async () => {
      if (!memoriaToken || Date.now() - ultimo > 20 * 60_000) return
      const actual = leer()
      if (!actual?.tokenVenc || actual.tokenVenc - Date.now() > 60 * 60_000) return
      try {
        const r = await api.personal.refresh()
        memoriaToken = r.tokenAcceso
        const siguiente = { ...actual, token: r.tokenAcceso, tokenVenc: Date.now() + r.expiraEn * 1000 }
        try { sessionStorage.setItem(Clave, JSON.stringify(siguiente)) } catch { /* sin storage */ }
        fijarSesion((s) => (s ? { ...s, token: siguiente.token, tokenVenc: siguiente.tokenVenc } : s))
      } catch { /* si falla, el proximo pedido con 401 cierra la sesion */ }
    }, 60_000)
    return () => { clearInterval(t); evs.forEach((e) => window.removeEventListener(e, tocar)) }
  }, [])
  useEffect(() => { configurarHttp({ onNoAutorizado: (alcance) => { if (alcance === 'staff') firmarSalida() } }) }, [firmarSalida])
  const valor = useMemo(() => ({ sesion, listo, firmarIn, firmarSalida, actualizar }), [sesion, listo, firmarIn, firmarSalida, actualizar])
  return <SesionCtx.Provider value={valor}>{children}</SesionCtx.Provider>
}

export function useSesion() {
  const c = useContext(SesionCtx)
  if (!c) throw new Error('SessionProvider ausente')
  return c
}
export const isDuenio = (s: Sesion | null) => s?.rol === 'DUENIO' || s?.rol === 'SOPORTE'
export const isSoporte = (s: Sesion | null) => s?.rol === 'SOPORTE'
