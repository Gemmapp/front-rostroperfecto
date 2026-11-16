import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { HorarioSelector } from '@/componentes/selector-horario'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Avatar } from '@/componentes/interfaz/visualizacion'
import { Field } from '@/componentes/interfaz/campo'
import { api, type ReservaServicio } from '@/libreria/api/peticiones'
import { marcaEstilo, tonoDesdeColor } from '@/libreria/marca'
import { cn } from '@/libreria/clases'
import { diaLargo, hoyISO } from '@/libreria/fechas'
import { ars } from '@/libreria/formato'
import { errMensaje, useCargar } from '@/libreria/ganchos'

const dur = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`)

/** Pagina publica "Agenda tu turno": sin login, pensada para compartir en Instagram y WhatsApp. */
export default function Reservar() {
  const { ref = '' } = useParams()
  const info = useCargar(() => api.reserva.info(ref), [ref])
  const [serv, fijarServ] = useState<ReservaServicio | null>(null)
  const [horario, fijarHorario] = useState({ fecha: hoyISO(), hora: '' })
  const [f, fijarF] = useState({ name: '', telefono: '', nota: '' })
  const [ocupado, fijarOcupado] = useState(false)
  const [error, fijarError] = useState<string | null>(null)
  const [hecho, fijarHecho] = useState<{ cuando: string; estado: string; ruta: string } | null>(null)
  const i = info.datos
  const tono = tonoDesdeColor(i?.local.colorAcento)

  async function reservar(e: React.FormEvent) {
    e.preventDefault(); fijarError(null)
    if (!serv || !horario.hora) return fijarError('Elegí el servicio, el día y el horario.')
    if (f.name.trim().length < 2) return fijarError('Poné tu nombre.')
    if (f.telefono.replace(/\D/g, '').length < 8) return fijarError('Poné tu WhatsApp o teléfono (con código de área).')
    fijarOcupado(true)
    try {
      const r = await api.reserva.reservar(ref, { servicioId: serv.id, inicio: `${horario.fecha}T${horario.hora}`, nombreCliente: f.name.trim(), telefono: f.telefono.trim(), nota: f.nota.trim() || undefined })
      fijarHecho({ cuando: r.turno.inicioLocal, estado: r.turno.estado, ruta: r.rutaGestion })
    } catch (err) { fijarError(errMensaje(err)) } finally { fijarOcupado(false) }
  }

  if (info.error) return <div className="grid min-h-dvh place-items-center bg-background p-6"><div className="max-w-[420px] text-center"><h1 className="display text-[30px]">Esta agenda no está disponible</h1><p className="text-[15px] text-muted-foreground">Puede que el local todavía no la haya habilitado. Probá más tarde o escribile directamente.</p></div></div>
  if (!i) return null
  const wa = i.local.telefono ? `https://wa.me/${i.local.telefono.replace(/\D/g, '')}` : null

  return (
    <div style={marcaEstilo(tono)} className="brand-scope min-h-dvh bg-background">
      <main className="mx-auto flex w-full max-w-[520px] flex-col gap-[18px] px-[18px] pb-12 pt-6">
        <header className="flex items-center gap-3">
          <Avatar nombre={i.local.nombre} foto={i.local.logoUrl ?? undefined} tamanio={52} tono={tono} />
          <div className="flex flex-col"><span className="text-sm text-muted-foreground">Agenda tu turno en</span><h1 className="display text-[28px] leading-none tracking-[-.03em]">{i.local.nombre}</h1></div>
        </header>
        {i.mensaje && <p className="m-0 rounded-card bg-accent-soft p-3 text-[15px]">{i.mensaje}</p>}

        {hecho ? (
          <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px]" aria-live="polite">
            <h2 className="display m-0 text-[26px] leading-tight">{hecho.estado === 'CONFIRMADO' ? '¡Turno confirmado!' : '¡Recibimos tu pedido!'}</h2>
            <p className="m-0 text-[16px]"><strong>{serv?.nombre}</strong><br /><span>{diaLargo(hecho.cuando.slice(0, 10))}</span> a las <strong>{hecho.cuando.slice(11, 16)}</strong></p>
            <p className="m-0 text-[15px] text-muted-foreground">{hecho.estado === 'CONFIRMADO' ? 'Te esperamos.' : 'El local lo va a confirmar y te avisa. Guardá este enlace para ver o cancelar tu turno.'}</p>
            <a href={hecho.ruta} className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-[16px] font-semibold no-underline !text-primary-foreground">Ver o cancelar mi turno</a>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-center text-sm font-semibold underline">Escribir al local por WhatsApp</a>}
          </section>
        ) : (
          <form onSubmit={reservar} className="flex flex-col gap-[18px]">
            <section className="flex flex-col gap-2" aria-label="Servicio">
              <h2 className="m-0 text-[17px] font-semibold">1. Elegí el servicio</h2>
              {i.servicios.map((s) => (
                <button key={s.id} type="button" aria-pressed={serv?.id === s.id} onClick={() => { fijarServ(s); fijarHorario({ ...horario, hora: '' }) }}
                  className={cn('flex min-h-14 items-center justify-between gap-3 rounded-card border p-3 text-left', serv?.id === s.id ? 'border-primary-text bg-accent-soft' : 'border-border bg-card')}>
                  <span className="flex flex-col"><span className="text-[16px] font-semibold">{s.nombre}</span><span className="text-[13px] text-muted-foreground">{dur(s.duracionMin)}</span></span>
                  <span className="text-[15px] font-semibold">{ars(s.precio)}</span>
                </button>
              ))}
              {i.servicios.length === 0 && <p className="m-0 text-sm text-muted-foreground">Este local todavía no cargó servicios.</p>}
            </section>
            <section className="flex flex-col gap-2" aria-label="Día y horario">
              <h2 className="m-0 text-[17px] font-semibold">2. Elegí el día y el horario</h2>
              <HorarioSelector reservaRef={ref} servicioId={serv?.id} dias={i.maxDiasAnticipacion} valor={horario} onCambiar={fijarHorario} />
            </section>
            <section className="flex flex-col gap-3" aria-label="Tus datos">
              <h2 className="m-0 text-[17px] font-semibold">3. Tus datos</h2>
              <Field etiqueta="Tu nombre" autoComplete="name" value={f.name} onChange={(e) => fijarF({ ...f, name: e.target.value })} />
              <Field etiqueta="WhatsApp o teléfono" inputMode="tel" autoComplete="tel" value={f.telefono} onChange={(e) => fijarF({ ...f, telefono: e.target.value })} pista="Con código de área, para avisarte si hay un cambio." />
              <Field etiqueta="Comentario (opcional)" value={f.nota} onChange={(e) => fijarF({ ...f, nota: e.target.value })} />
            </section>
            {error && <Aviso>{error}</Aviso>}
            <Boton type="submit" disabled={ocupado || !serv || !horario.hora}>{ocupado ? 'Reservando…' : 'Reservar turno'}</Boton>
            <p className="m-0 text-center text-xs text-muted-foreground">Usamos tus datos solo para gestionar tu turno.</p>
          </form>
        )}
      </main>
    </div>
  )
}
