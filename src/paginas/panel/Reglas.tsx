import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Segmentado, Contador, Interruptor } from '@/componentes/interfaz/controles'
import { SeccionTitulo } from '@/componentes/interfaz/visualizacion'
import { cn } from '@/libreria/clases'
import { obtenerOrigen } from '@/libreria/datos'
import type { Reglas } from '@/libreria/datos/tipos'
import { ars } from '@/libreria/formato'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { useGuia } from '@/libreria/guia'
import { isDuenio, useSesion } from '@/libreria/sesion'

/** Solo dueños: el empleado vuelve a Inicio con un aviso (el servidor igual responde 403). */
export default function Reglas() {
  const { sesion } = useSesion()
  if (!isDuenio(sesion)) return <Navigate to="/panel" replace state={{ aviso: 'Las reglas solo las ven y cambian los dueños del local.' }} />
  return <ReglasInterno />
}

function ReglasInterno() {
  const { sesion } = useSesion()
  const origen = obtenerOrigen()
  const { terminar } = useGuia()
  const cargado = useCargar(() => origen.obtenerReglas(sesion!), [])
  const servicios = useCargar(async () => (await origen.listarServicios(sesion!)).filter((s) => s.activo), [])
  const [r, fijarR] = useState<Reglas | null>(null)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const [ocupado, fijarOcupado] = useState(false)
  useEffect(() => { if (cargado.datos) fijarR(cargado.datos) }, [cargado.datos])
  const duenio = isDuenio(sesion)
  const fijar = (p: Partial<Reglas>) => { fijarMensaje(null); fijarR((x) => (x ? { ...x, ...p } : x)) }

  async function guardar() {
    if (!r) return
    fijarOcupado(true)
    try { await origen.guardarReglas(sesion!, r); if (!terminar()) { fijarMensaje({ ok: true, texto: 'Reglas guardadas.' }); window.scrollTo({ top: 0, behavior: 'smooth' }) } } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) } finally { fijarOcupado(false) }
  }
  const premioNombre = servicios.datos?.find((s) => s.id === r?.premio.servicioId)?.nombre

  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-6 pt-6 lg:px-0 lg:pt-2">
      <header className="flex items-center justify-between">
        <h1 className="display text-[42px] leading-none tracking-[-.04em]">Reglas</h1>
        
      </header>
      {mensaje && <Aviso ok={mensaje.ok}>{mensaje.texto}</Aviso>}
      {cargado.error && <Aviso>{cargado.error}</Aviso>}
      {!duenio && <Aviso>Las reglas solo las cambian los dueños del local.</Aviso>}
      {r && (
        <fieldset disabled={!duenio} className="m-0 flex min-w-0 flex-col gap-[18px] border-0 p-0 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
          <section className="rounded-card border border-border bg-card px-[18px] py-2 lg:col-start-1">
            <div className="flex flex-col gap-2 py-2">
              <span className="text-base font-semibold">Devolución por</span>
              <Segmentado etiqueta="Devolución por" valor={r.devolucionModo} onCambiar={(devolucionModo) => fijar({ devolucionModo })} opciones={[{ valor: 'PORCENTAJE', etiqueta: 'Porcentaje' }, { valor: 'PUNTOS', etiqueta: 'Valor de punto' }]} />
            </div>
            <Contador etiqueta="Devolución base" deshabilitado={r.devolucionModo !== 'PORCENTAJE'} valor={r.pct} min={1} max={20} onCambiar={(pct) => fijar({ pct })} formato={(v) => `${v}%`} />
            <Contador etiqueta="Puntos por servicio" deshabilitado={r.devolucionModo !== 'PUNTOS'} valor={r.puntosPorServicio} min={1} max={100} onCambiar={(puntosPorServicio) => fijar({ puntosPorServicio })} />
            <Contador etiqueta="Valor del punto" valor={r.puntoValor} min={5} max={100} paso={5} onCambiar={(puntoValor) => fijar({ puntoValor })} formato={(v) => ars(v)} />
            <div className="flex min-h-[60px] items-center justify-between gap-3 py-2"><span className="text-base font-semibold">Los puntos vencen</span><Interruptor etiqueta="Los puntos vencen" marcado={r.meses !== null} onCambiar={(on) => fijar({ meses: on ? 12 : null })} /></div>
            {r.meses !== null && <Contador etiqueta="Vencimiento" valor={r.meses} min={1} max={24} onCambiar={(meses) => fijar({ meses })} formato={(v) => `${v} m`} />}
            <Contador etiqueta="Tope de canje" valor={r.tope} min={5} max={100} paso={5} onCambiar={(tope) => fijar({ tope })} formato={(v) => `${v}%`} />
          </section>
          <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px] lg:col-start-1" aria-label="Premio por visitas">
            <div className="flex items-center justify-between gap-3">
              <span className="flex flex-col"><span className="text-base font-semibold">Premio por visitas</span><span className="text-[13px] text-muted-foreground">Opcional</span></span>
              <Interruptor etiqueta="Premio por visitas" marcado={r.premio.on} onCambiar={(on) => fijar({ premio: { ...r.premio, on } })} />
            </div>
            {r.premio.on && (
              <>
                <Contador etiqueta="A la visita número" valor={r.premio.n} min={2} max={12} onCambiar={(n) => fijar({ premio: { ...r.premio, n } })} />
                <div className="flex flex-col gap-2"><span className="text-sm text-muted-foreground">Servicio de premio</span>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Servicio de premio">
                    {servicios.datos?.map((s) => <button key={s.id} type="button" aria-pressed={r.premio.servicioId === s.id} onClick={() => fijar({ premio: { ...r.premio, servicioId: s.id } })}
                      className={cn('min-h-11 rounded-full px-4 text-sm font-semibold', r.premio.servicioId === s.id ? 'border border-primary-text bg-accent-soft' : 'border border-border bg-card')}>{s.nombre}</button>)}
                  </div>
                </div>
              </>
            )}
          </section>
          <section className="flex flex-col gap-2 rounded-card bg-accent-soft p-[18px] lg:sticky lg:top-6 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:self-start lg:p-6" aria-label="Resumen">
            <SeccionTitulo>Así queda en la práctica</SeccionTitulo>
            <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-snug">
              {r.devolucionModo === 'PORCENTAJE'
                ? <li>Por cada $1.000 de servicio, el cliente suma {ars(Math.floor((1000 * r.pct) / 100))}.</li>
                : <li>Cada servicio suma {r.puntosPorServicio} {r.puntosPorServicio === 1 ? 'punto' : 'puntos'} y cada punto vale {ars(r.puntoValor)}: {ars(r.puntosPorServicio * r.puntoValor)} por servicio.</li>}
              <li>Cada punto vale {ars(r.puntoValor)} al mostrar y canjear.</li>
              <li>Los puntos {r.meses === null ? 'no vencen.' : `vencen a los ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'}.`}</li>
              <li>Puede descontar hasta el {r.tope}% de cada compra.</li>
              {r.premio.on && <li>A la visita {r.premio.n}, {premioNombre ?? 'el servicio elegido'} es gratis.</li>}
            </ul>
            <p className="text-xs text-muted-foreground">Estimación ilustrativa. Los montos reales los define el servidor.</p>
          </section>
          {duenio && <Boton className="lg:col-start-1 lg:w-auto lg:self-start lg:px-10" disabled={ocupado} onClick={guardar}>{ocupado ? 'Guardando…' : 'Guardar reglas'}</Boton>}
        </fieldset>
      )}
    </div>
  )
}
