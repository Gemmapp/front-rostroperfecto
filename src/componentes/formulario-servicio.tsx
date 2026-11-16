import { useGuia } from '@/libreria/guia'
import { useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { FotoSelector } from '@/componentes/selector-foto'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Segmentado, Interruptor } from '@/componentes/interfaz/controles'
import { Field } from '@/componentes/interfaz/campo'
import { cn } from '@/libreria/clases'
import { obtenerOrigen } from '@/libreria/datos'
import type { ServicioElemento } from '@/libreria/datos/tipos'
import { ars } from '@/libreria/formato'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { api } from '@/libreria/api/peticiones'
import { isDuenio, useSesion } from '@/libreria/sesion'

const Preajustes = [3, 5, 8, 10]

/** Solo dueños: el servidor igual responde 403 a los empleados. */
export function ServicioFormulario({ servicio }: { servicio?: ServicioElemento }) {
  const { sesion } = useSesion()
  if (!isDuenio(sesion)) return <div className="p-[18px]"><Aviso>El catálogo solo lo editan los dueños del local.</Aviso></div>
  return <ServicioFormularioInterno servicio={servicio} />
}

function ServicioFormularioInterno({ servicio }: { servicio?: ServicioElemento }) {
  const navegar = useNavigate()
  const { terminar } = useGuia()
  const { sesion } = useSesion()
  const origen = obtenerOrigen()
  const reglas = useCargar(() => origen.obtenerReglas(sesion!), [])
  const basePct = reglas.datos?.pct ?? 5
  const [nombre, fijarNombre] = useState(servicio?.nombre ?? '')
  const [precio, fijarPrecio] = useState(servicio ? String(servicio.precio) : '')
  const [modo, fijarModo] = useState<'pct' | 'fixed'>(servicio?.modo ?? 'pct')
  const [pct, fijarPct] = useState<number | undefined>(servicio ? servicio.pct : undefined) // undefined = valor de Reglas
  const [fijo, fijarFijo] = useState(servicio?.fijo ? String(servicio.fijo) : '')
  const [activo, fijarActivo] = useState(servicio?.activo ?? true)
  const [foto, fijarFoto] = useState(servicio?.foto)
  const [duracion, fijarDuracion] = useState(servicio?.duracionMin ?? 60)
  const [quien, fijarQuien] = useState<string[]>(servicio?.personalIds ?? [])
  const equipo = useCargar(() => api.personal.listarPersonal(sesion!.localId), [])
  const [mostrarErr, fijarMostrarErr] = useState(false)
  const [error, fijarError] = useState<string | null>(null)
  const [ocupado, fijarOcupado] = useState(false)

  const precioN = Number(precio.replace(/\D/g, '')) || 0
  const fijoN = Number(fijo.replace(/\D/g, '')) || 0
  const invalido = { nombre: !nombre.trim(), precio: precioN <= 0, fijo: modo === 'fixed' && fijoN <= 0 }
  // Estimacion ilustrativa; el servidor define lo que realmente suma.
  const puntos = reglas.datos?.devolucionModo === 'PUNTOS'
  const estimar = puntos ? (reglas.datos!.puntosPorServicio * reglas.datos!.puntoValor) : modo === 'fixed' ? fijoN : Math.floor((precioN * (pct ?? basePct)) / 100)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (invalido.nombre || invalido.precio || invalido.fijo) { fijarMostrarErr(true); return }
    fijarOcupado(true); fijarError(null)
    try {
      await origen.guardarServicio(sesion!, servicio?.id ?? null, { nombre: nombre.trim(), precio: precioN, modo, pct: modo === 'pct' ? pct : undefined, fijo: modo === 'fixed' ? fijoN : undefined, activo, foto, duracionMin: duracion, personalIds: quien })
      if (!terminar()) navegar('/panel/servicios', { replace: true })
    } catch (err) { fijarError(errMensaje(err)) } finally { fijarOcupado(false) }
  }

  const etiqueta = (on: boolean) => cn('h-11 flex-1 rounded-[14px] border text-[15px] font-semibold', on ? 'border-primary-text bg-accent-soft text-foreground' : 'border-border bg-card text-foreground')
  return (
    <form onSubmit={enviar} noValidate className="mx-auto flex w-full flex-col gap-4 px-[18px] pb-10 pt-[18px] lg:max-w-[600px] lg:px-0">
      <div className="flex items-center justify-between">
        <Boton variante="secondary" tamanio="pastilla" className="!w-auto" onClick={() => navegar(-1)}>‹ Cancelar</Boton>
      </div>
      <h1 className="display text-[36px] leading-none tracking-[-.035em]">{servicio ? 'Editar servicio' : 'Servicio nuevo'}</h1>
      <FotoSelector etiqueta="Foto del servicio" valor={foto} onCambiar={fijarFoto} />
      <Field etiqueta="Nombre *" value={nombre} onChange={(e) => fijarNombre(e.target.value)} error={mostrarErr && invalido.nombre ? 'Completá lo marcado para guardar.' : undefined} />
      <Field etiqueta="Precio *" inputMode="numeric" placeholder="14.000" value={precio ? new Intl.NumberFormat('es-AR').format(precioN) : ''} onChange={(e) => fijarPrecio(e.target.value)} error={mostrarErr && invalido.precio ? 'Poné un precio mayor a cero.' : undefined} />
      <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-4" aria-label="Turnos">
        <h2 className="text-[17px] font-semibold">Para la agenda de turnos</h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Cuánto dura</span>
          <select value={duracion} onChange={(e) => fijarDuracion(Number(e.target.value))} className="h-[54px] rounded-field border-[1.5px] border-border bg-card px-4 text-[17px] font-medium text-foreground">
            {Array.from({ length: 32 }, (_, i) => (i + 1) * 15).map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`}</option>)}
          </select>
        </label>
        <div className="flex flex-col gap-2" role="group" aria-label="Quién lo realiza">
          <span className="text-sm text-muted-foreground">Quién lo realiza (si no elegís a nadie, va a la agenda general del local)</span>
          <div className="flex flex-wrap gap-2">
            {equipo.datos?.map((m) => {
              const on = quien.includes(m.usuarioId)
              return <button key={m.usuarioId} type="button" aria-pressed={on} onClick={() => fijarQuien(on ? quien.filter((x) => x !== m.usuarioId) : [...quien, m.usuarioId])}
                className={cn('min-h-11 rounded-full border px-4 text-sm font-semibold', on ? 'border-primary-text bg-accent-soft' : 'border-border bg-card')}>{m.nombre}</button>
            })}
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-4" aria-label="Devolución">
        <h2 className="text-[17px] font-semibold">Qué le devolvés al cliente</h2>
        <p className="m-0 text-sm text-muted-foreground">Por defecto cada servicio usa la regla general que definiste en <strong>Reglas</strong>. Cambialo acá solo si este servicio devuelve distinto.</p>
        {puntos && <p className="text-sm text-muted-foreground">Este local devuelve por valor de punto: todos los servicios suman lo mismo. Se configura en Reglas.</p>}
        <fieldset disabled={puntos} className={cn('m-0 flex min-w-0 flex-col gap-3 border-0 p-0', puntos && 'opacity-45')}>
        <Segmentado etiqueta="Tipo de devolución" valor={modo} onCambiar={fijarModo} opciones={[{ valor: 'pct', etiqueta: 'Porcentaje' }, { valor: 'fixed', etiqueta: 'Monto en pesos' }]} />
        {modo === 'pct' ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Porcentaje">
            {Preajustes.map((p) => <button key={p} type="button" aria-pressed={pct === p} className={etiqueta(pct === p)} onClick={() => fijarPct(p)}>{p}%</button>)}
            <button type="button" aria-pressed={pct === undefined} className={cn(etiqueta(pct === undefined), 'min-w-full')} onClick={() => fijarPct(undefined)}>Usar la regla general ({basePct}%)</button>
          </div>
        ) : (
          <Field etiqueta="Monto a devolver *" inputMode="numeric" placeholder="600" value={fijo ? new Intl.NumberFormat('es-AR').format(fijoN) : ''} onChange={(e) => fijarFijo(e.target.value)} error={mostrarErr && invalido.fijo ? 'Poné un monto mayor a cero.' : undefined} />
        )}
        </fieldset>
        <p className="rounded-[14px] bg-accent-soft px-3.5 py-3 text-sm leading-snug" aria-live="polite">Con este servicio el cliente suma <strong className="font-semibold">{puntos ? `${reglas.datos!.puntosPorServicio} puntos (${ars(estimar)})` : ars(estimar)}</strong> <span className="text-muted-foreground">(estimación)</span></p>
      </section>
      <div className="flex min-h-[52px] items-center justify-between gap-3">
        <span className="flex flex-col"><span className="text-base font-semibold">Servicio activo</span><span className="text-[13px] text-muted-foreground">Apagado, no aparece al registrar visitas ni en la agenda online. No se borra: lo podés volver a prender.</span></span>
        <Interruptor etiqueta="Servicio activo" marcado={activo} onCambiar={fijarActivo} />
      </div>
      {error && <Aviso>{error}</Aviso>}
      <Boton type="submit" disabled={ocupado}>{ocupado ? 'Guardando…' : servicio ? 'Guardar cambios' : 'Crear servicio'}</Boton>
    </form>
  )
}
