import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Suspense, useEffect, useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Interruptor } from '@/componentes/interfaz/controles'
import { Avatar, nivelNombre } from '@/componentes/interfaz/visualizacion'
import { InferiorHoja } from '@/componentes/interfaz/hoja'
import { ApiError } from '@/libreria/api/http'
import { obtenerOrigen } from '@/libreria/datos'
import { sumarEtiqueta, puntosYPesos } from '@/libreria/datos/sumar'
import type { VisitaVistaPrevia } from '@/libreria/datos/tipos'
import { fijarComprobante } from '@/libreria/flujo'
import { ars } from '@/libreria/formato'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { isDuenio, useSesion } from '@/libreria/sesion'
import { cn } from '@/libreria/clases'
import { useEscritorio } from '@/libreria/usar-media'

function Registrar() {
  const navegar = useNavigate()
  const clienteId = useSearchParams()[0].get('c') ?? ''
  const { sesion } = useSesion()
  const origen = obtenerOrigen()
  const cliente = useCargar(() => origen.obtenerCliente(sesion!, clienteId), [clienteId])
  const reglas = useCargar(() => origen.obtenerReglas(sesion!), [])
  const servicios = useCargar(async () => (await origen.listarServicios(sesion!)).filter((s) => s.activo), [])
  const [elegido, fijarElegido] = useState<string[]>([])
  const [canje, fijarCanje] = useState(false)
  const [vistaPrevia, fijarVistaPrevia] = useState<VisitaVistaPrevia | null>(null)
  const [error, fijarError] = useState<string | null>(null)
  const [duplicada, fijarDuplicada] = useState(false)
  const [ocupado, fijarOcupado] = useState(false)

  // El servidor calcula el total, el tope de descuento y lo que se cobra; aca solo se muestra.
  useEffect(() => {
    if (elegido.length === 0) { fijarVistaPrevia(null); return }
    let vivo = true
    origen.vistaPreviaVisita(sesion!, clienteId, elegido, canje).then((p) => vivo && (fijarVistaPrevia(p), fijarError(null))).catch((e) => vivo && fijarError(errMensaje(e)))
    return () => { vivo = false }
  }, [elegido, canje, clienteId, sesion, origen])

  const interruptor = (id: string) => { fijarDuplicada(false); fijarElegido((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])) }

  async function registrar(confirmarDuplicada: boolean) {
    fijarOcupado(true); fijarError(null)
    try {
      fijarComprobante({ ...(await origen.registrarVisita(sesion!, clienteId, elegido, canje, confirmarDuplicada)), puntosModo: reglas.datos?.devolucionModo === 'PUNTOS' })
      navegar('/panel/comprobante', { replace: true })
    } catch (e) {
      if (e instanceof ApiError && e.problema.codigo === 'VISITA_DUPLICADA') { fijarDuplicada(true); fijarError('Ya se registró una visita igual hace pocos minutos. Puede ser un duplicado.') }
      else fijarError(errMensaje(e))
    } finally { fijarOcupado(false) }
  }

  const escritorio = useEscritorio()
  const c = cliente.datos
  const tieneSel = elegido.length > 0
  const resumen = (
    <>
          <div className="flex items-baseline justify-between text-[15px]">
            <span className="font-semibold">{elegido.length} {elegido.length === 1 ? 'servicio' : 'servicios'}</span>
            <span className="display tnum text-[22px]">{vistaPrevia ? ars(vistaPrevia.subtotal) : '…'}</span>
          </div>
          <div className="flex min-h-[52px] items-center justify-between gap-3">
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold">Usar lo acumulado</span>
              <span className="text-[13px] text-muted-foreground">{vistaPrevia ? (vistaPrevia.maxDescuento > 0 ? `Hasta ${vistaPrevia.topePct}% · −${ars(canje ? vistaPrevia.descuento : vistaPrevia.maxDescuento)}` : 'No tiene saldo para descontar') : '…'}</span>
            </span>
            <Interruptor etiqueta="Usar lo acumulado" marcado={canje && (vistaPrevia?.maxDescuento ?? 0) > 0} onCambiar={(v) => { fijarCanje(v); fijarDuplicada(false) }} />
          </div>
          {vistaPrevia?.premioDesbloqueado && <p className="rounded-[14px] bg-accent-soft px-3.5 py-2.5 text-sm font-medium">Premio por visitas desbloqueado: {vistaPrevia.premioDesbloqueado} gratis.</p>}
          {error && <Aviso>{error}</Aviso>}
          <Boton disabled={ocupado || !vistaPrevia} onClick={() => registrar(false)}>{ocupado ? 'Registrando…' : `Registrar · cobrar ${vistaPrevia ? ars(vistaPrevia.toPagar) : '…'}`}</Boton>
          {duplicada && isDuenio(sesion) && <Boton variante="secondary" tamanio="md" className="w-full" disabled={ocupado} onClick={() => registrar(true)}>Registrar igual</Boton>}
          {vistaPrevia && <p className="text-center text-[13px] text-muted-foreground">Esta visita suma {reglas.datos?.devolucionModo === 'PUNTOS' && vistaPrevia.sumarPuntos !== undefined ? puntosYPesos(vistaPrevia.sumarPuntos, vistaPrevia.sumar) : ars(vistaPrevia.sumar)} a su saldo</p>}
    </>
  )
  return (
    <div className={cn('flex min-h-[calc(100dvh-56px)] flex-col lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8', tieneSel && 'pb-[250px] lg:pb-0')}>
      <div className="flex flex-col gap-[18px] px-[18px] pb-4 pt-[18px] lg:px-0 lg:pt-2">
        <Boton variante="secondary" tamanio="pastilla" className="!w-auto self-start" onClick={() => navegar(-1)}>‹ Cancelar</Boton>
        {cliente.error && <Aviso>{cliente.error}</Aviso>}
        {c && (
          <div className="rise flex items-center gap-3.5 rounded-[26px] bg-[#2A1D21] p-[18px] text-[#FAF2F3]">
            <Avatar nombre={c.nombre} tamanio={52} foto={c.foto} />
            <div className="flex flex-1 flex-col gap-[3px]"><span className="text-lg font-semibold tracking-[-.01em]">{c.nombre}</span><span className="text-[13px] text-[#FAF2F3]/70">{c.nivel ? `${nivelNombre(c.nivel)} · ` : ''}saldo disponible</span></div>
            <span className="display tnum text-[28px] tracking-[-.03em]">{ars(c.saldo)}</span>
          </div>
        )}
        <div className="flex flex-col gap-1"><h1 className="display text-[32px] tracking-[-.035em]">¿Qué se hizo hoy?</h1><span className="text-sm text-muted-foreground">Podés elegir más de uno.</span></div>
        {servicios.datos?.length === 0 && <p className="text-[15px] leading-normal text-muted-foreground">No hay servicios disponibles. Cargalos en la solapa Servicios.</p>}
        {servicios.error && <Aviso>{servicios.error}</Aviso>}
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {servicios.datos?.map((s) => {
            const on = elegido.includes(s.id)
            return (
              <li key={s.id}>
                <button type="button" role="checkbox" aria-checked={on} onClick={() => interruptor(s.id)}
                  className={cn('flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-[22px] border-2 bg-card px-4 text-left text-foreground transition-all', on ? 'border-primary-text shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_40%,transparent)]' : 'border-border')}>
                  <span className={cn('grid size-7 flex-none place-items-center rounded-[9px] border-2 text-[15px] font-bold text-primary-foreground', on ? 'border-primary-text bg-primary' : 'border-border bg-transparent')}>{on ? '✓' : ''}</span>
                  <span className="flex flex-1 flex-col gap-[3px]"><span className="text-base font-semibold leading-tight">{s.nombre}</span><span className="text-[13px] text-muted-foreground">{sumarEtiqueta(s, reglas.datos)}</span></span>
                  <span className="display text-[22px] tracking-tight">{ars(s.precio)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      {escritorio ? (
        <aside className="sticky top-6 flex h-fit flex-col gap-3 rounded-card border border-border bg-card p-6 shadow-card" aria-label="Resumen de la visita">
          <h2 className="text-lg font-semibold">Resumen</h2>
          {tieneSel ? resumen : <p className="text-sm text-muted-foreground">Elegí al menos un servicio para ver el total y registrar la visita.</p>}
        </aside>
      ) : tieneSel && <InferiorHoja>{resumen}</InferiorHoja>}
    </div>
  )
}

export default function Pagina() {
  // Sin cliente elegida no hay nada que registrar: se vuelve a elegir (sin llamadas invalidas a la API).
  if (!useSearchParams()[0].get('c')) return <Navigate to="/panel/clientes?elegir=1" replace />
  return <Suspense fallback={null}><Registrar /></Suspense>
}
