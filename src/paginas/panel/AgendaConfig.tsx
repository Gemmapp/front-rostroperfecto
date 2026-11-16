import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Interruptor } from '@/componentes/interfaz/controles'
import { SeccionTitulo } from '@/componentes/interfaz/visualizacion'
import { Field, TextoArea } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import type { ReservaConfig } from '@/libreria/api/tipos'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { isDuenio, useSesion } from '@/libreria/sesion'
import { urlPublica } from '@/libreria/enlaces'

const Dias: { key: string; etiqueta: string }[] = [
  { key: '1', etiqueta: 'Lunes' }, { key: '2', etiqueta: 'Martes' }, { key: '3', etiqueta: 'Miércoles' }, { key: '4', etiqueta: 'Jueves' },
  { key: '5', etiqueta: 'Viernes' }, { key: '6', etiqueta: 'Sábado' }, { key: '0', etiqueta: 'Domingo' },
]
type Horarios = Record<string, { desde: string; to: string }[]>

const sel = 'h-[54px] w-full rounded-field border-[1.5px] border-border bg-card px-4 text-[17px] font-medium text-foreground'

export default function AgendaConfig() {
  const { sesion } = useSesion()
  if (!isDuenio(sesion)) return <Navigate to="/panel/agenda" replace state={{ aviso: 'La configuración de la agenda es de los dueños del local.' }} />
  return <Interno />
}

function Interno() {
  const { sesion } = useSesion()
  const localId = sesion!.localId
  const cargado = useCargar(() => api.personal.reservaConfig(localId), [localId])
  const [s, fijarS] = useState<ReservaConfig | null>(null)
  const [ocupado, fijarOcupado] = useState(false)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const [copiado, fijarCopiado] = useState(false)
  useEffect(() => { if (cargado.datos) fijarS(cargado.datos) }, [cargado.datos])
  const fijar = (p: Partial<ReservaConfig>) => { fijarMensaje(null); fijarS((x) => (x ? { ...x, ...p } : x)) }
  const horarios = (s?.horarios ?? {}) as Horarios
  const fijarDia = (k: string, rs: Horarios[string]) => fijar({ horarios: { ...horarios, [k]: rs } })

  async function guardar() {
    if (!s) return
    fijarOcupado(true); fijarMensaje(null)
    try {
      const guardado = await api.personal.guardarReservaConfig(localId, { ...s, alias: (s.alias ?? '').trim().toLowerCase(), mensaje: s.mensaje?.trim() || null })
      fijarS(guardado); fijarMensaje({ ok: true, texto: 'Agenda guardada.' }); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) } finally { fijarOcupado(false) }
  }

  const enlace = s ? urlPublica(s.rutaPublica ?? "") : ''
  const compartir = `Reservá tu turno online en ${sesion!.localNombre}: ${enlace}`
  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-10 pt-4 lg:px-0 lg:pt-2">
      <header className="flex items-center justify-between gap-3">
        <h1 className="display text-[36px] leading-none tracking-[-.04em]">Configurar agenda</h1>
        <Link to="/panel/agenda" className="text-sm font-semibold underline">‹ Volver a la agenda</Link>
      </header>
      {mensaje && <Aviso ok={mensaje.ok}>{mensaje.texto}</Aviso>}
      {cargado.error && <Aviso>{cargado.error}</Aviso>}
      {s && (
        <div className="flex flex-col gap-4 lg:max-w-[680px]">
          <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px]">
            <div className="flex min-h-[52px] items-center justify-between gap-3">
              <span className="flex flex-col"><span className="text-base font-semibold">Agenda online</span><span className="text-[13px] text-muted-foreground">Tus clientes reservan solos desde un enlace.</span></span>
              <Interruptor etiqueta="Agenda online" marcado={s.habilitado} onCambiar={(habilitado) => fijar({ habilitado: habilitado })} />
            </div>
            <Field etiqueta="Nombre de tu página" autoCapitalize="none" value={s.alias ?? ''} onChange={(e) => fijar({ alias: e.target.value })} pista="Solo minúsculas, números y guiones. Ej: rostro-perfecto" />
            {s.habilitado && (
              <div className="flex flex-col gap-2 rounded-[14px] bg-accent-soft p-3">
                <strong className="text-sm">Tu enlace para compartir</strong>
                <input readOnly value={enlace} onFocus={(e) => e.currentTarget.select()} aria-label="Enlace de reservas" className="h-11 w-full rounded-field border border-border bg-card px-3 text-[14px]" />
                <div className="flex flex-wrap gap-2">
                  <Boton tamanio="md" variante="secondary" onClick={() => { void navigator.clipboard?.writeText(enlace).then(() => fijarCopiado(true)).catch(() => {}) }}>{copiado ? 'Copiado ✓' : 'Copiar enlace'}</Boton>
                  <a href={`https://wa.me/?text=${encodeURIComponent(compartir)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold no-underline text-foreground">Compartir por WhatsApp</a>
                </div>
                <span className="text-[13px] text-muted-foreground">En Instagram, ponelo en la biografía o en una historia con el botón "Enlace". Guardá los cambios para que el enlace nuevo funcione.</span>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px]">
            <SeccionTitulo>Horarios de atención</SeccionTitulo>
            {Dias.map(({ key, etiqueta }) => {
              const rs = horarios[key] ?? []
              return (
                <div key={key} className="flex flex-col gap-2 border-t border-border pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between"><span className="text-[16px] font-semibold">{etiqueta}</span>
                    {rs.length === 0 ? <button type="button" onClick={() => fijarDia(key, [{ desde: '09:00', to: '18:00' }])} className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold">Abrir</button>
                      : <button type="button" onClick={() => fijarDia(key, [])} className="min-h-11 rounded-full px-3 text-sm font-semibold text-muted-foreground underline">Cerrado</button>}
                  </div>
                  {rs.length === 0 && <span className="text-[13px] text-muted-foreground">Cerrado</span>}
                  {rs.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" aria-label={`${etiqueta}: desde`} value={r.desde} onChange={(e) => fijarDia(key, rs.map((x, j) => (j === i ? { ...x, desde: e.target.value } : x)))} className="h-11 flex-1 rounded-field border border-border bg-card px-3 text-[16px]" />
                      <span>a</span>
                      <input type="time" aria-label={`${etiqueta}: hasta`} value={r.to} onChange={(e) => fijarDia(key, rs.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))} className="h-11 flex-1 rounded-field border border-border bg-card px-3 text-[16px]" />
                      <button type="button" aria-label="Quitar franja" onClick={() => fijarDia(key, rs.filter((_, j) => j !== i))} className="size-11 flex-none rounded-full border border-border">✕</button>
                    </div>
                  ))}
                  {rs.length > 0 && rs.length < 4 && <button type="button" onClick={() => fijarDia(key, [...rs, { desde: '14:00', to: '18:00' }])} className="self-start text-sm font-semibold underline">+ Agregar otra franja (ej. después del mediodía)</button>}
                </div>
              )
            })}
          </section>

          <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px]">
            <SeccionTitulo>Reglas de reserva</SeccionTitulo>
            <label className="flex flex-col gap-1.5"><span className="text-sm text-muted-foreground">Horarios de inicio</span>
              <select className={sel} value={s.pasoMin} onChange={(e) => fijar({ pasoMin: Number(e.target.value) as 0 | 15 | 30 | 60 })}><option value={0}>Según la duración de cada servicio</option><option value={15}>Cada 15 minutos</option><option value={30}>Cada 30 minutos</option><option value={60}>Cada 1 hora</option></select></label>
            <label className="flex flex-col gap-1.5"><span className="text-sm text-muted-foreground">Aviso mínimo para reservar</span>
              <select className={sel} value={s.minHorasAviso} onChange={(e) => fijar({ minHorasAviso: Number(e.target.value) })}>{[0, 1, 2, 4, 12, 24, 48].map((h) => <option key={h} value={h}>{h === 0 ? 'Sin aviso mínimo' : `${h} hora${h > 1 ? 's' : ''} antes`}</option>)}</select></label>
            <label className="flex flex-col gap-1.5"><span className="text-sm text-muted-foreground">Hasta cuántos días adelante se puede reservar</span>
              <select className={sel} value={s.maxDiasAnticipacion} onChange={(e) => fijar({ maxDiasAnticipacion: Number(e.target.value) })}>{[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d} días</option>)}</select></label>
            <div className="flex min-h-[52px] items-center justify-between gap-3">
              <span className="flex flex-col"><span className="text-base font-semibold">Confirmar turnos automáticamente</span><span className="text-[13px] text-muted-foreground">Apagado: cada turno queda "por confirmar" hasta que lo apruebes.</span></span>
              <Interruptor etiqueta="Confirmar turnos automáticamente" marcado={s.confirmacionAutomatica} onCambiar={(autoConfirmar) => fijar({ confirmacionAutomatica: autoConfirmar })} />
            </div>
            <TextoArea etiqueta="Mensaje en tu página (opcional)" value={s.mensaje ?? ''} maxLength={300} onChange={(e) => fijar({ mensaje: e.target.value })} />
          </section>
          <Boton disabled={ocupado} onClick={guardar} className="lg:w-auto lg:self-start lg:px-10">{ocupado ? 'Guardando…' : 'Guardar agenda'}</Boton>
        </div>
      )}
    </div>
  )
}
