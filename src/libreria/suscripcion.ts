import { api } from '@/libreria/api/peticiones'
import type { Suscripcion } from '@/libreria/api/tipos'
import { useCargar } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

// Un solo pedido por local aunque lo usen el menu, la barra lateral y el aviso a la vez.
const cache = new Map<string, Promise<Suscripcion | null>>()

function cargar(localId: string): Promise<Suscripcion | null> {
  let p = cache.get(localId)
  if (!p) {
    p = api.personal.suscripcion(localId).catch(() => null)
    cache.set(localId, p)
    setTimeout(() => cache.delete(localId), 30_000)
  }
  return p
}

/** Estado de la suscripcion, solo para el dueño principal. null si no corresponde o todavía no está activada (oculta). */
export function useSuscripcion(): Suscripcion | null {
  const { sesion } = useSesion()
  const principal = (sesion?.rol === 'DUENIO' || sesion?.rol === 'SOPORTE')
  const { datos } = useCargar(async () => (principal ? await cargar(sesion!.localId) : null), [sesion?.localId, principal])
  return datos && datos.habilitado ? datos : null
}
