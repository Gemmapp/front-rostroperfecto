import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HorarioSelector } from '@/componentes/selector-horario'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { SeccionTitulo } from '@/componentes/interfaz/visualizacion'
import { Field } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import type { Turno } from '@/libreria/api/tipos'
import { cn } from '@/libreria/clases'
import { agregarDias, diaLargo, diaCorto, finHora, horaOf, hoyISO } from '@/libreria/fechas'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { isDuenio, useSesion } from '@/libreria/sesion'

const Estado: Record<string, { etiqueta: string; clases: string }> = {
  Pendiente: { etiqueta: 'Por confirmar', clases: 'bg-[#FFF1D6] text-[#7A4B00]' },
  CONFIRMED: { etiqueta: 'Confirmado', clases: 'bg-[#DDF3E4] text-[#14532D]' },
  COMPLETED: { etiqueta: 'Asistió', clases: 'bg-muted text-foreground' },
  NOMostrar: { etiqueta: 'No vino', clases: 'bg-destructive/10 text-destructive' },
  Cancelado: { etiqueta: 'Cancelado', clases: 'bg-muted text-muted-foreground line-through' },
}

export default function Agenda() {
  const { sesion } = useSesion()
  const localId = sesion!.localId
  const duenio = isDuenio(sesion)
  const [fecha, fijarFecha] = useState(hoyISO())
  const [tiraInicio, fijarTiraInicio] = useState(hoyISO())
  const semana = useCargar(() => api.personal.appointments(localId, tiraInicio, agregarDias(tiraInicio, 6)), [localId, tiraInicio])
  const pendiente = useCargar(async () => (await api.personal.appointments(localId, hoyISO(), agregarDias(hoyISO(), 60))).filter((a) => a.estado === 'PENDIENTE'), [localId])
  const config = useCargar(async () => (duenio ? await api.personal.reservaConfig(localId).catch(() => null) : null), [localId, duenio])
  const servicios = useCargar(() => api.personal.listarServicios(localId), [localId])
  const [ocupado, fijarOcupado] = useState<string | null>(null)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const [moviendo, fijarMoviendo] = useState<string | null>(null)
  const [mv, fijarMv] = useState({ fecha: '', hora: '' })
  const [creando, fijarCreando] = useState(false)
  const [nf, fijarNf] = useState({ servicioId: '', name: '', telefono: '', fecha: hoyISO(), hora: '' })

  const byDia = useMemo(() => {
    const m: Record<string, Turno[]> = {}
    for (const a of semana.datos ?? []) (m[a.inicioLocal.slice(0, 10)] ??= []).push(a)
    for (const k of Object.keys(m)) m[k].sort((x, y) => x.inicioLocal.localeCompare(y.inicioLocal))
    return m
  }, [semana.datos])
  const dia = (byDia[fecha] ?? []).filter((a) => a.estado !== 'CANCELADO')
  const cancelado = (byDia[fecha] ?? []).filter((a) => a.estado === 'CANCELADO')

  function recargar() { semana.recargar(); pendiente.recargar() }
  async function accion(a: Turno, estado: 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO' | 'NO_ASISTIO') {
    if (estado === 'CANCELADO' && !window.confirm(`¿Cancelar el turno de ${a.nombreCliente}?`)) return
    fijarOcupado(a.id + estado); fijarMensaje(null)
    try { await api.personal.fijarTurnoEstado(localId, a.id, estado); recargar() } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) } finally { fijarOcupado(null) }
  }
  async function mover(a: Turno) {
    if (!mv.fecha || !mv.hora) return fijarMensaje({ ok: false, texto: 'Elegí el día y el horario nuevos.' })
    fijarOcupado(a.id + 'move'); fijarMensaje(null)
    try { await api.personal.moverTurno(localId, a.id, `${mv.fecha}T${mv.hora}`); fijarMoviendo(null); fijarMensaje({ ok: true, texto: 'Turno movido.' }); recargar() }
    catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) } finally { fijarOcupado(null) }
  }
  async function crear(e: React.FormEvent) {
    e.preventDefault(); fijarMensaje(null)
    if (!nf.servicioId || !nf.hora) return fijarMensaje({ ok: false, texto: 'Elegí servicio, día y horario.' })
    if (nf.name.trim().length < 2) return fijarMensaje({ ok: false, texto: 'Poné el nombre del cliente.' })
    fijarOcupado('new')
    try {
      await api.personal.crearTurno(localId, { servicioId: nf.servicioId, inicio: `${nf.fecha}T${nf.hora}`, nombreCliente: nf.name.trim(), telefono: nf.telefono.trim() })
      fijarCreando(false); fijarNf({ servicioId: '', name: '', telefono: '', fecha: nf.fecha, hora: '' }); fijarFecha(nf.fecha); fijarTiraInicio(nf.fecha); fijarMensaje({ ok: true, texto: 'Turno cargado y confirmado.' }); recargar()
    } catch (err) { fijarMensaje({ ok: false, texto: errMensaje(err) }) } finally { fijarOcupado(null) }
  }

  function Tarjeta({ a, mostrarFecha }: { a: Turno; mostrarFecha?: boolean }) {
    const st = Estado[a.estado]
    const abierto = a.estado === 'PENDIENTE' || a.estado === 'CONFIRMADO'
    const iniciado = new Date(a.inicio).getTime() <= Date.now()
    const b = (k: string) => ocupado === a.id + k
    return (
      <li className="flex flex-col gap-2 rounded-card border border-border bg-card p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="text-[17px] font-semibold">{mostrarFecha && <span className="capitalize">{diaCorto(a.inicioLocal.slice(0, 10))} · </span>}{horaOf(a.inicioLocal)}–{finHora(a.inicioLocal, a.duracionMin)} · {a.nombreServicio}</span>
            <span className="truncate text-[15px]">{a.nombreCliente}{a.nombreRecurso ? ` · con ${a.nombreRecurso}` : ''}</span>
            {a.telefono && <span className="text-[13px] text-muted-foreground">{a.telefono}</span>}
          </div>
          <span className={cn('flex-none rounded-full px-2.5 py-1 text-xs font-semibold', st?.clases)}>{st?.etiqueta ?? a.estado}</span>
        </div>
        {a.nota && <p className="m-0 text-[13px] text-muted-foreground">“{a.nota}”</p>}
        {abierto && (
          <div className="flex flex-wrap gap-2">
            {a.estado === 'PENDIENTE' && <Boton tamanio="md" disabled={ocupado !== null} onClick={() => accion(a, 'CONFIRMADO')}>{b('CONFIRMADO') ? '…' : 'Confirmar'}</Boton>}
            {a.estado === 'CONFIRMADO' && iniciado && <><Boton tamanio="md" disabled={ocupado !== null} onClick={() => accion(a, 'COMPLETADO')}>Asistió</Boton><Boton tamanio="md" variante="secondary" disabled={ocupado !== null} onClick={() => accion(a, 'NO_ASISTIO')}>No vino</Boton></>}
            <Boton tamanio="md" variante="secondary" onClick={() => { fijarMoviendo(moviendo === a.id ? null : a.id); fijarMv({ fecha: a.inicioLocal.slice(0, 10), hora: '' }) }}>Mover</Boton>
            {a.urlWhatsapp && <a href={a.urlWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold no-underline text-foreground">WhatsApp</a>}
            <Boton tamanio="md" variante="secondary" disabled={ocupado !== null} onClick={() => accion(a, 'CANCELADO')}>Cancelar</Boton>
          </div>
        )}
        {a.estado === 'COMPLETADO' && <Link to="/panel/escanear" className="text-sm font-semibold underline">Cargar la visita y sus puntos</Link>}
        {moviendo === a.id && (
          <div className="flex flex-col gap-3 rounded-[14px] bg-accent-soft p-3">
            <strong className="text-sm">Mover a otro horario</strong>
            <HorarioSelector reservaRef={localId} servicioId={a.servicioId} dias={30} valor={mv} onCambiar={fijarMv} />
            <Boton tamanio="md" disabled={ocupado !== null || !mv.hora} onClick={() => mover(a)}>{b('move') ? 'Moviendo…' : 'Mover turno'}</Boton>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-10 pt-4 lg:px-0 lg:pt-2">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-[42px] leading-none tracking-[-.04em]">Agenda</h1>
        <div className="flex gap-2">
          {duenio && <Link to="/panel/agenda/configuracion" className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold no-underline text-foreground">Configurar</Link>}
          <Boton tamanio="md" onClick={() => { fijarCreando(!creando); fijarMensaje(null) }}>{creando ? 'Cerrar' : 'Nuevo turno'}</Boton>
        </div>
      </header>
      {mensaje && <Aviso ok={mensaje.ok}>{mensaje.texto}</Aviso>}
      {duenio && config.datos && !config.datos.habilitado && (
        <p className="m-0 rounded-card bg-accent-soft p-3 text-[15px]">Tu agenda online está apagada: tus clientes todavía no pueden reservar solos. <Link to="/panel/agenda/configuracion" className="font-semibold underline">Prenderla</Link></p>
      )}

      {creando && (
        <form onSubmit={crear} className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px] lg:max-w-[640px]" aria-label="Nuevo turno">
          <SeccionTitulo>Nuevo turno</SeccionTitulo>
          <label className="flex flex-col gap-1.5"><span className="text-sm text-muted-foreground">Servicio</span>
            <select value={nf.servicioId} onChange={(e) => fijarNf({ ...nf, servicioId: e.target.value, hora: '' })} className="h-[54px] rounded-field border-[1.5px] border-border bg-card px-4 text-[17px] font-medium">
              <option value="">Elegí un servicio</option>
              {servicios.datos?.filter((s) => s.activo).map((s) => <option key={s.id} value={s.id}>{s.nombre} · {s.duracionMin ?? 60} min</option>)}
            </select></label>
          <HorarioSelector reservaRef={localId} servicioId={nf.servicioId || undefined} dias={30} valor={{ fecha: nf.fecha, hora: nf.hora }} onCambiar={(v) => fijarNf({ ...nf, ...v })} />
          <Field etiqueta="Nombre del cliente" value={nf.name} onChange={(e) => fijarNf({ ...nf, name: e.target.value })} />
          <Field etiqueta="WhatsApp o teléfono" inputMode="tel" value={nf.telefono} onChange={(e) => fijarNf({ ...nf, telefono: e.target.value })} />
          <Boton type="submit" disabled={ocupado !== null}>{ocupado === 'new' ? 'Guardando…' : 'Guardar turno'}</Boton>
        </form>
      )}

      {pendiente.datos && pendiente.datos.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Por confirmar">
          <SeccionTitulo>Por confirmar ({pendiente.datos.length})</SeccionTitulo>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 lg:max-w-[760px]">{pendiente.datos.map((a) => <Tarjeta key={a.id} a={a} mostrarFecha />)}</ul>
        </section>
      )}

      <section className="flex flex-col gap-3" aria-label="Día">
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Semana anterior" onClick={() => fijarTiraInicio(agregarDias(tiraInicio, -7))} className="size-11 flex-none rounded-full border border-border bg-card text-lg">‹</button>
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto" role="group" aria-label="Días">
            {Array.from({ length: 7 }, (_, i) => agregarDias(tiraInicio, i)).map((d) => {
              const n = (byDia[d] ?? []).filter((a) => a.estado !== 'CANCELADO').length
              return (
                <button key={d} type="button" aria-pressed={fecha === d} onClick={() => fijarFecha(d)}
                  className={cn('flex min-h-14 min-w-[58px] flex-1 flex-col items-center justify-center rounded-[14px] border px-2 text-[13px] font-semibold capitalize', fecha === d ? 'border-primary-text bg-accent-soft' : 'border-border bg-card')}>
                  {diaCorto(d)}<span className={cn('text-[11px] font-medium', n ? 'text-primary-text' : 'text-muted-foreground')}>{n ? `${n} turno${n > 1 ? 's' : ''}` : '—'}</span>
                </button>
              )
            })}
          </div>
          <button type="button" aria-label="Semana siguiente" onClick={() => fijarTiraInicio(agregarDias(tiraInicio, 7))} className="size-11 flex-none rounded-full border border-border bg-card text-lg">›</button>
        </div>
        <h2 className="m-0 text-[20px] font-semibold">{diaLargo(fecha)}</h2>
        {semana.error && <Aviso>{semana.error}</Aviso>}
        {semana.datos && dia.length === 0 && <p className="m-0 rounded-card border border-border bg-card p-[18px] text-[15px] text-muted-foreground">No hay turnos este día.</p>}
        <ul className="m-0 flex list-none flex-col gap-2 p-0 lg:max-w-[760px]">{dia.map((a) => <Tarjeta key={a.id} a={a} />)}</ul>
        {cancelado.length > 0 && <p className="m-0 text-sm text-muted-foreground">{cancelado.length} cancelado{cancelado.length > 1 ? 's' : ''} este día.</p>}
      </section>
    </div>
  )
}
