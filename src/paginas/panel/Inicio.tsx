import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Segmentado } from '@/componentes/interfaz/controles'
import { Avatar, Pastilla, SeccionTitulo, DatoTarjeta } from '@/componentes/interfaz/visualizacion'
import { api } from '@/libreria/api/peticiones'
import { obtenerOrigen } from '@/libreria/datos'
import { origenEtiqueta } from '@/libreria/datos/origen'
import type { Periodo } from '@/libreria/datos/tipos'
import { horaOf, hoyISO } from '@/libreria/fechas'
import { ars, arsFirmado, num } from '@/libreria/formato'
import { errMensaje, useCantidadUp, useCargar } from '@/libreria/ganchos'
import { isDuenio, useSesion } from '@/libreria/sesion'

function AreaGrafico({ serie }: { serie: number[] }) {
  const { linea, area, ultimo } = useMemo(() => {
    const datos = serie.length > 1 ? serie : [0, ...serie, 0]
    const max = Math.max(...datos, 1) * 1.15, n = datos.length
    const pts = datos.map((y, i) => [(i * 320) / (n - 1), 100 - (y / max) * 92])
    let d = `M${pts[0][0]} ${pts[0][1]}`
    for (let i = 1; i < n; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}` }
    return { linea: d, area: `${d} L320 110 L0 110 Z`, ultimo: pts[n - 1] }
  }, [serie])
  return (
    <div className="relative -mx-1.5 h-[110px] lg:h-[200px]" role="img" aria-label="Gráfico de visitas">
      <svg viewBox="0 0 320 110" preserveAspectRatio="none" className="h-[110px] w-full overflow-visible lg:h-[200px]">
        <path d={area} style={{ fill: 'var(--primary)', fillOpacity: 0.25 }} />
        <path d={linea} fill="none" style={{ stroke: 'var(--primary-text)' }} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute size-3.5 rounded-full border-[3px] border-card bg-primary shadow-[0_0_0_1px_var(--primary-text)]" style={{ left: `${(ultimo[0] / 320) * 100}%`, top: `${(ultimo[1] / 110) * 100}%`, margin: '-7px 0 0 -7px' }} />
    </div>
  )
}

const hoyEtiqueta = () => { const s = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }); return s[0].toUpperCase() + s.slice(1) }
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
const variacion = (p?: number | null) => (p == null ? 'sin período anterior' : `${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p)}% vs. anterior`)

export default function Inicio() {
  const { sesion } = useSesion()
  const origen = obtenerOrigen()
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso
  const [periodo, fijarPeriodo] = useState<Periodo>('MES')
  const [dias, fijarDias] = useState(60)
  const { datos, error } = useCargar(() => origen.inicio(sesion!, periodo, dias), [periodo, dias])
  const [notified, fijarNotified] = useState<Record<string, boolean>>({})
  const [avisarError, fijarAvisarError] = useState<string | null>(null)
  const visitas = useCantidadUp(datos?.visitas?.cantidad ?? 0, 800)
  // Turnos de hoy (si la agenda no esta disponible, el bloque simplemente no se muestra)
  const hoy = hoyISO()
  const agenda = useCargar(async () => { try { return (await api.personal.appointments(sesion!.localId, hoy, hoy)).filter((a) => a.inicioLocal.slice(0, 10) === hoy) } catch { return null } }, [sesion?.localId])
  const turnos = (agenda.datos ?? []).filter((a) => a.estado !== 'CANCELADO').sort((a, b) => a.inicioLocal.localeCompare(b.inicioLocal))
  const ahoraHM = new Date().toTimeString().slice(0, 5)
  const abiertos = turnos.filter((a) => a.estado === 'PENDIENTE' || a.estado === 'CONFIRMADO')
  const proximo = abiertos.find((a) => horaOf(a.inicioLocal) >= ahoraHM)
  const visitasHoy = (datos?.actividad ?? []).filter((f) => !f.revertido).length
  const periodoTexto = periodo === 'HOY' ? 'hoy' : periodo === 'SEMANA' ? 'últimos 7 días' : 'este mes'

  async function avisar(id: string) {
    fijarAvisarError(null)
    try { await origen.avisar(sesion!, id); fijarNotified((n) => ({ ...n, [id]: true })) } catch (e) { fijarAvisarError(errMensaje(e)) }
  }

  const tarjeta = 'rounded-card-lg border border-border bg-card shadow-card'
  const barras = (items: { key: string; etiqueta: string; cantidad: number; atenuado?: boolean }[], unidad: (n: number) => string) => (
    <ul className="m-0 list-none px-5 pb-2 pt-1">
      {items.map((t) => (
        <li key={t.key} className="flex flex-col gap-2 border-b border-border py-3.5 last:border-b-0">
          <div className="flex justify-between text-[15px]"><span className={t.atenuado ? 'font-medium text-muted-foreground' : 'font-medium'}>{t.etiqueta}</span><span className="tnum text-muted-foreground">{unidad(t.cantidad)}</span></div>
          <div className="h-2 rounded-full bg-muted" role="img" aria-label={`${t.etiqueta}: ${t.cantidad}`}><div className={t.atenuado ? 'h-full rounded-full bg-muted-foreground/50' : 'h-full rounded-full bg-primary-text'} style={{ width: `${(t.cantidad / Math.max(...items.map((i) => i.cantidad), 1)) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  )
  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-9 pt-6 lg:gap-5 lg:px-0 lg:pt-2">
      <header className="rise flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{hoyEtiqueta()}</span>
          <h1 className="display text-[32px] leading-[1.05] tracking-[-.03em]">Buen día, {sesion!.usuarioNombre}</h1>
        </div>
        <span className="hidden lg:block"><Avatar nombre={sesion!.usuarioNombre} foto={sesion!.usuarioFoto} tamanio={46} tono={sesion!.marca.tono} /></span>
      </header>
      {aviso && <p role="status" className="rounded-[14px] bg-muted px-4 py-3 text-sm text-muted-foreground">{aviso}</p>}
      {error && <Aviso>{error}</Aviso>}
      {datos && (
        <>
          {/* Resumen del dia */}
          <section className="rise grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5" style={{ ['--i' as string]: 1 }} aria-label="Resumen de hoy">
            {agenda.datos && <DatoTarjeta etiqueta="Turnos de hoy" valor={abiertos.length} pista={proximo ? `Próximo: ${horaOf(proximo.inicioLocal)} · ${proximo.nombreCliente}` : abiertos.length ? 'Ya pasaron todos' : 'Sin turnos hoy'} />}
            <DatoTarjeta etiqueta="Visitas de hoy" valor={visitasHoy} pista="registradas en el mostrador" />
            {datos.canjes && <DatoTarjeta etiqueta="Canjes" valor={num(datos.canjes.cantidad)} pista={`${ars(datos.canjes.descuentos)} en descuentos, ${periodoTexto}`} />}
            {datos.puntosEmitidos !== null && <DatoTarjeta etiqueta="Puntos emitidos" valor={ars(datos.puntosEmitidos)} pista="en total, desde que empezaron" />}
          </section>

          <div className="flex flex-col gap-[18px] lg:grid lg:grid-cols-3 lg:items-start lg:gap-5">
            {/* Columna principal */}
            <div className="contents lg:col-span-2 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
              {datos.visitas && (
                <section className={`rise order-2 flex flex-col gap-3.5 px-5 pb-3.5 pt-5 lg:order-none lg:col-span-2 lg:p-6 ${tarjeta}`} style={{ ['--i' as string]: 2 }} aria-label="Visitas">
                  <Segmentado etiqueta="Período" valor={periodo} onCambiar={fijarPeriodo} opciones={[{ valor: 'HOY', etiqueta: 'Hoy' }, { valor: 'SEMANA', etiqueta: '7 días' }, { valor: 'MES', etiqueta: 'Mes' }]} />
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1.5"><span className="text-sm text-muted-foreground">Visitas, {periodoTexto}</span><span className="display tnum text-[72px] leading-[.85] tracking-[-.04em]" aria-label={`${datos.visitas.cantidad} visitas`}>{num(visitas)}</span></div>
                    <Pastilla className="mb-1">{variacion(datos.visitas.variacionPct)}</Pastilla>
                  </div>
                  <AreaGrafico serie={datos.visitas.serie} />
                </section>
              )}
              {datos.top && datos.top.length > 0 && (
                <section className={`rise order-3 flex flex-col gap-1 pt-4 lg:order-none ${tarjeta}`} style={{ ['--i' as string]: 3 }}>
                  <div className="px-5"><SeccionTitulo>Servicios más pedidos</SeccionTitulo></div>
                  {barras(datos.top.map((t) => ({ key: t.nombre, etiqueta: t.nombre, cantidad: t.cantidad })), (n) => `${n} ${n === 1 ? 'vez' : 'veces'}`)}
                </section>
              )}
              {isDuenio(sesion) && datos.origenes && datos.origenes.length > 0 && (
                <section className={`rise order-4 flex flex-col gap-1 pt-4 lg:order-none ${tarjeta}`} style={{ ['--i' as string]: 3 }} aria-label="De dónde llegan tus clientes">
                  <div className="px-5"><SeccionTitulo>De dónde llegan tus clientes</SeccionTitulo></div>
                  {barras(datos.origenes.map((o) => ({ key: o.origen ?? 'sin', etiqueta: origenEtiqueta(o.origen), cantidad: o.cantidad, atenuado: !o.origen })), (n) => `${n} ${n === 1 ? 'cliente' : 'clientes'}`)}
                </section>
              )}
            </div>

            {/* Columna lateral */}
            <div className="contents lg:flex lg:flex-col lg:gap-5">
              {agenda.datos && (
                <section className={`rise order-1 flex flex-col gap-2 p-5 lg:order-none ${tarjeta}`} style={{ ['--i' as string]: 2 }} aria-label="Agenda de hoy">
                  <div className="flex items-center justify-between"><SeccionTitulo>Agenda de hoy</SeccionTitulo><Link to="/panel/agenda" className="text-sm font-semibold text-primary-text">Ver agenda</Link></div>
                  {turnos.length === 0 ? <p className="m-0 text-sm text-muted-foreground">No hay turnos para hoy.</p> : (
                    <ul className="m-0 list-none p-0">
                      {turnos.slice(0, 6).map((a) => (
                        <li key={a.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
                          <span className="display tnum w-[52px] flex-none text-[18px]">{horaOf(a.inicioLocal)}</span>
                          <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[15px] font-medium">{a.nombreCliente}</span><span className="truncate text-[13px] text-muted-foreground">{a.nombreServicio}</span></span>
                          {a.estado === 'PENDIENTE' && <span className="rounded-full bg-[#FFF1D6] px-2.5 py-1 text-[11px] font-semibold text-[#7A4B00]">Por confirmar</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {turnos.length > 6 && <span className="text-[13px] text-muted-foreground">y {turnos.length - 6} más</span>}
                </section>
              )}
              <section className={`rise order-5 flex flex-col gap-1 px-5 pb-3 pt-4 lg:order-none ${tarjeta}`} style={{ ['--i' as string]: 4 }}>
                <SeccionTitulo>Actividad de hoy</SeccionTitulo>
                {datos.actividad.length === 0 ? <p className="m-0 py-3 text-sm text-muted-foreground">Todavía no hubo visitas hoy.</p> : (
                  <ul className="m-0 list-none p-0">
                    {datos.actividad.slice(0, 6).map((f) => (
                      <li key={f.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                        <Avatar nombre={f.nombre} tamanio={38} />
                        <div className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[15px] font-medium">{f.nombre}</span><span className="truncate text-[13px] text-muted-foreground">{f.servicios} · {hhmm(f.at)}{f.revertido ? ' · revertida' : ''}</span></div>
                        <span className="display text-[17px]" style={{ color: f.revertido ? 'var(--muted-foreground)' : 'var(--success)' }}>{f.acumulado !== undefined ? arsFirmado(f.acumulado) : ars(f.monto)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="rise order-6 flex flex-col gap-2 rounded-card-lg bg-foreground p-5 text-background lg:order-none lg:p-6" style={{ ['--i' as string]: 5 }}>
                <span className="text-sm opacity-75">No vuelven hace más de…</span>
                <Segmentado inverso etiqueta="Días sin volver" valor={dias} onCambiar={fijarDias} opciones={[30, 45, 60, 90].map((d) => ({ valor: d, etiqueta: `${d} días` }))} />
                <span className="display mt-2 text-[38px] leading-none tracking-[-.03em]">{datos.sinVolver.cantidad} {datos.sinVolver.cantidad === 1 ? 'cliente' : 'clientes'}</span>
                {avisarError && <Aviso className="!text-[#FFB4A8]">{avisarError}</Aviso>}
                <ul className="m-0 mt-1.5 flex list-none flex-col p-0">
                  {datos.sinVolver.clientes.map((p) => {
                    const hecho = p.notified || notified[p.id]
                    return (
                      <li key={p.id} className="flex items-center gap-3 border-t border-[rgba(127,127,127,.3)] py-[11px]">
                        <Avatar nombre={p.nombre} tamanio={38} />
                        <div className="flex flex-1 flex-col"><span className="text-[15px] font-medium">{p.nombre}</span><span className="text-[13px] opacity-65">hace {p.dias} días</span></div>
                        <Boton tamanio="sm" className="!w-auto font-bold" disabled={hecho} onClick={() => avisar(p.id)}>{hecho ? 'Avisado ✓' : 'Avisar'}</Boton>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
