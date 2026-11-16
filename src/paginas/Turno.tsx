import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Avatar } from '@/componentes/interfaz/visualizacion'
import { api } from '@/libreria/api/peticiones'
import { marcaEstilo, tonoDesdeColor } from '@/libreria/marca'
import { diaLargo, finHora } from '@/libreria/fechas'
import { errMensaje, useCargar } from '@/libreria/ganchos'

const Texto: Record<string, string> = { Pendiente: 'Esperando confirmación del local', CONFIRMED: 'Confirmado', Cancelado: 'Cancelado', COMPLETED: 'Realizado', NOMostrar: 'No asististe' }

/** Ver o cancelar un turno con el enlace personal (sin login). */
export default function Turno() {
  const { token = '' } = useParams()
  const datos = useCargar(() => api.reserva.turno(token), [token])
  const [ocupado, fijarOcupado] = useState(false)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  if (datos.error) return <div className="grid min-h-dvh place-items-center bg-background p-6"><div className="max-w-[420px] text-center"><h1 className="display text-[30px]">No encontramos este turno</h1><p className="text-[15px] text-muted-foreground">Revisá que el enlace esté completo.</p></div></div>
  if (!datos.datos) return null
  const { turno: a, local: local } = datos.datos
  const tono = tonoDesdeColor(local.colorAcento)
  const abierto = a.estado === 'PENDIENTE' || a.estado === 'CONFIRMADO'
  const wa = local.telefono ? `https://wa.me/${local.telefono.replace(/\D/g, '')}` : null

  async function cancelar() {
    if (!window.confirm('¿Querés cancelar este turno?')) return
    fijarOcupado(true); fijarMensaje(null)
    try { await api.reserva.cancelar(token); datos.recargar(); fijarMensaje({ ok: true, texto: 'Turno cancelado. Si querés, reservá otro cuando quieras.' }) } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) } finally { fijarOcupado(false) }
  }
  return (
    <div style={marcaEstilo(tono)} className="brand-scope min-h-dvh bg-background">
      <main className="mx-auto flex w-full max-w-[520px] flex-col gap-[18px] px-[18px] pb-12 pt-6">
        <header className="flex items-center gap-3"><Avatar nombre={local.nombre} foto={local.logoUrl ?? undefined} tamanio={52} tono={tono} /><h1 className="display text-[28px] leading-none tracking-[-.03em]">{local.nombre}</h1></header>
        <section className="flex flex-col gap-2 rounded-card border border-border bg-card p-[18px]">
          <span className="text-sm text-muted-foreground">Tu turno</span>
          <h2 className="display m-0 text-[26px] leading-tight">{a.nombreServicio}</h2>
          <p className="m-0 text-[16px]"><span>{diaLargo(a.inicioLocal.slice(0, 10))}</span><br />{a.inicioLocal.slice(11, 16)} a {finHora(a.inicioLocal, a.duracionMin)} h</p>
          <p className="m-0 text-[15px] font-semibold">{Texto[a.estado] ?? a.estado}</p>
          {local.direccion && <p className="m-0 text-[14px] text-muted-foreground">{local.direccion}</p>}
        </section>
        {mensaje && <Aviso ok={mensaje.ok}>{mensaje.texto}</Aviso>}
        {abierto && <Boton variante="secondary" disabled={ocupado} onClick={cancelar}>{ocupado ? 'Cancelando…' : 'Cancelar turno'}</Boton>}
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-center text-sm font-semibold underline">Escribir al local por WhatsApp</a>}
      </main>
    </div>
  )
}
