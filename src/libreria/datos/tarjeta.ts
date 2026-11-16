import { recursoUrl } from '@/libreria/api/http'
import type * as T from '@/libreria/api/tipos'
import { tonoDesdeColor } from '@/libreria/marca'
import type { TarjetaVista, Nivel, MovimientoElemento } from './tipos'

const Nivel: Record<T.Nivel, Nivel> = { BASE: 'base', PLATA: 'plata', ORO: 'oro' }
const Nombre: Record<T.Nivel, string> = { BASE: 'Base', PLATA: 'Plata', ORO: 'Oro' }
const tipo = (t: T.TarjetaVista['movimientos'][number]['tipo']): MovimientoElemento['tipo'] => (t === 'CANJE' ? 'redeem' : t === 'VENCIMIENTO' ? 'expire' : 'earn')

/** Convierte la tarjeta de la API (portal o enlace personal) al modelo de vista. No calcula nada. */
export function tarjetaDesdeApi(c: T.TarjetaVista, qrValor: string): TarjetaVista {
  return {
    clienteNombre: c.nombre, firstNombre: c.primerNombre, localNombre: c.local.nombre, localLogo: recursoUrl(c.local.logoUrl), marcaTono: tonoDesdeColor(c.local.colorAcento),
    nivel: Nivel[c.nivel], nivelBonusPct: c.bonusNivelPct, saldo: c.saldo, puntos: c.puntos, desde: c.clienteDesde, qrValor,
    siguienteNivel: { nombre: c.proximoNivel.nivel ? Nombre[c.proximoNivel.nivel] : undefined, falta: c.proximoNivel.falta ?? undefined, porcentaje: c.proximoNivel.avancePct },
    sellos: { habilitado: c.sellos.habilitado, total: c.sellos.total ?? undefined, hecho: c.sellos.cumplidos ?? undefined, desbloqueadoSiguiente: c.sellos.proximaDesbloquea, premioNombre: c.sellos.nombrePremio ?? undefined },
    porVencer: c.porVencer ? { monto: c.porVencer.monto, fecha: c.porVencer.venceEl } : undefined,
    movimientos: c.movimientos.map((m) => ({ id: m.id, tipo: tipo(m.tipo), titulo: m.descripcion, fecha: m.creadoEn, monto: m.monto })),
  }
}
export const logoOf = (c: T.TarjetaVista) => recursoUrl(c.local.logoUrl)
