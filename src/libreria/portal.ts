// Sesion del cliente en el portal (un token por local). Memoria + sessionStorage (mismo riesgo que el personal).
import { useEffect, useState } from 'react'
import { configurarHttp } from '@/libreria/api/http'

let activo: string | null = null
configurarHttp({ clienteToken: () => activo })
const key = (localId: string) => `rewards.customer.${localId}`

export function fijarClienteSesion(localId: string, token: string | null) {
  activo = token
  try { if (token) sessionStorage.setItem(key(localId), token); else sessionStorage.removeItem(key(localId)) } catch { /* sin storage */ }
}
export function restaurarClienteSesion(localId: string): string | null {
  try { activo = sessionStorage.getItem(key(localId)) } catch { activo = null }
  return activo
}

/** Pide un token del QR con `fetcher` y lo renueva antes de que venza (15 s de margen, o a mitad de vida si dura poco). */
export function useQrToken(buscador: () => Promise<{ token: string; expiraEnSegundos: number }>, habilitado = true, onAuthError?: () => void) {
  const [token, fijarToken] = useState<string | null>(null)
  const [fallido, fijarFallido] = useState(false)
  useEffect(() => {
    if (!habilitado) return
    let vivo = true
    let temporizador: ReturnType<typeof setTimeout>
    const ejecutar = async () => {
      let siguiente = 5000
      try {
        const t = await buscador()
        if (!vivo) return
        fijarToken(t.token); fijarFallido(false)
        const vida = t.expiraEnSegundos * 1000
        siguiente = Math.max(1000, vida > 30000 ? vida - 15000 : vida / 2)
      } catch (e) {
        if (!vivo) return
        fijarFallido(true)
        const estado = (e as { estado?: number }).estado
        if (estado === 401 || estado === 404) { onAuthError?.(); return }
      }
      temporizador = setTimeout(ejecutar, siguiente)
    }
    ejecutar()
    return () => { vivo = false; clearTimeout(temporizador) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado, onAuthError])
  return { token, fallido }
}
