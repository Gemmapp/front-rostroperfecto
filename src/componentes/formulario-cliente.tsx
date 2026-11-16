import { useGuia } from '@/libreria/guia'
import { useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Field, ElegirCaja, TextoArea } from '@/componentes/interfaz/campo'
import { Origenes } from '@/libreria/datos/origen'
import type { Origen } from '@/libreria/datos/tipos'
import { FotoSelector } from '@/componentes/selector-foto'
import { obtenerOrigen } from '@/libreria/datos'
import type { Cliente } from '@/libreria/datos/tipos'
import { dniDigitos, dniFormato } from '@/libreria/formato'
import { errMensaje } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

export function ClienteFormulario({ cliente }: { cliente?: Cliente }) {
  const navegar = useNavigate()
  const { terminar } = useGuia()
  const { sesion } = useSesion()
  const origen = obtenerOrigen()
  const editando = !!cliente
  const [f, fijarF] = useState({ name: cliente?.nombre ?? '', dni: cliente?.dni ?? '', telefono: cliente?.telefono ?? '', cumpleanios: cliente?.cumpleanios ?? '', nota: cliente?.nota ?? '', foto: cliente?.foto, origen: (cliente?.origen ?? '') as Origen | '', instagram: cliente?.instagram ?? '' })
  const [errores, fijarErrores] = useState<{ nombre?: string; dni?: string; instagram?: string }>({})
  const [error, fijarError] = useState<string | null>(null)
  const [ocupado, fijarOcupado] = useState(false)
  const [confirmar, fijarConfirmar] = useState<0 | 1 | 2>(0)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const nuevos: typeof errores = {}
    if (!f.name.trim()) nuevos.nombre = 'Completá el nombre.'
    if (f.dni.length !== 8) nuevos.dni = 'El DNI tiene 8 dígitos.'
    if (f.instagram.trim() && !/^@?[A-Za-z0-9._]{1,30}$/.test(f.instagram.trim())) nuevos.instagram = 'Solo letras, números, punto y guion bajo.'
    fijarErrores(nuevos)
    if (Object.keys(nuevos).length) return
    fijarOcupado(true); fijarError(null)
    try {
      const guardado = await origen.guardarCliente(sesion!, cliente?.id ?? null, { nombre: f.name.trim(), dni: f.dni, telefono: f.telefono.trim() || undefined, cumpleanios: f.cumpleanios.trim() || undefined, nota: f.nota.trim() || undefined, foto: f.foto, origen: f.origen || undefined, instagram: f.instagram.trim() || undefined })
      if (!terminar()) navegar(`/panel/clientes/${guardado.id}`, { replace: true })
    } catch (err) { fijarError(errMensaje(err)) } finally { fijarOcupado(false) }
  }
  async function quitar() {
    if (confirmar < 2) { fijarConfirmar(2); return }
    try { await origen.quitarCliente(sesion!, cliente!.id); navegar('/panel/clientes', { replace: true }) } catch (err) { fijarError(errMensaje(err)); fijarConfirmar(0) }
  }

  return (
    <form onSubmit={enviar} noValidate className="mx-auto flex w-full flex-col gap-4 px-[18px] pb-10 pt-[18px] lg:max-w-[600px] lg:px-0">
      <div className="flex items-center justify-between">
        <Boton variante="secondary" tamanio="pastilla" className="!w-auto" onClick={() => navegar(-1)}>‹ Cancelar</Boton>
      </div>
      <h1 className="display text-[36px] leading-none tracking-[-.035em]">{editando ? 'Editar cliente' : 'Cliente nueva'}</h1>
      <FotoSelector redondear etiqueta="Foto del cliente" valor={f.foto} onCambiar={(foto) => fijarF({ ...f, foto })} />
      <Field etiqueta="Nombre *" value={f.name} onChange={(e) => fijarF({ ...f, name: e.target.value })} error={errores.nombre} autoComplete="off" />
      <Field etiqueta="DNI *" inputMode="numeric" placeholder="38.455.210" value={dniFormato(f.dni)} onChange={(e) => fijarF({ ...f, dni: dniDigitos(e.target.value) })} error={errores.dni} disabled={editando} pista={editando ? 'El DNI no se puede cambiar.' : undefined} />
      <Field etiqueta="WhatsApp" inputMode="tel" placeholder="11 5555 1020" value={f.telefono} onChange={(e) => fijarF({ ...f, telefono: e.target.value })} />
      <Field etiqueta="Cumpleaños" type="date" value={f.cumpleanios} onChange={(e) => fijarF({ ...f, cumpleanios: e.target.value })} />
      <ElegirCaja etiqueta="¿Cómo nos conoció?" value={f.origen} onChange={(e) => fijarF({ ...f, origen: e.target.value as Origen | '' })}>
        <option value="">Sin dato</option>
        {Origenes.map((s) => <option key={s.valor} value={s.valor}>{s.etiqueta}</option>)}
      </ElegirCaja>
      <Field etiqueta="Instagram (@usuario)" autoCapitalize="none" autoCorrect="off" placeholder="@usuario" value={f.instagram} onChange={(e) => fijarF({ ...f, instagram: e.target.value })} error={errores.instagram} />
      <TextoArea etiqueta="Nota" value={f.nota} onChange={(e) => fijarF({ ...f, nota: e.target.value })} />
      {error && <Aviso>{error}</Aviso>}
      <Boton type="submit" disabled={ocupado}>{ocupado ? 'Guardando…' : editando ? 'Guardar cambios' : 'Dar de alta'}</Boton>
      {editando && (
        confirmar === 0 ? <Boton variante="danger" tamanio="md" onClick={() => fijarConfirmar(1)}>Quitar cliente</Boton>
          : (
            <div className="flex flex-col gap-2 rounded-card border border-destructive/40 p-4" role="alertdialog" aria-label="Confirmar baja">
              <p className="text-[15px] font-medium">{confirmar === 1 ? `¿Querés quitar a ${cliente!.nombre}?` : 'Esto no se puede deshacer. ¿Seguro que querés quitarla?'}</p>
              <div className="flex gap-2"><Boton variante="danger" tamanio="md" className="flex-1 border border-destructive" onClick={quitar}>{confirmar === 1 ? 'Sí, quitarla' : 'Quitar definitivamente'}</Boton><Boton variante="secondary" tamanio="md" onClick={() => fijarConfirmar(0)}>No</Boton></div>
            </div>
          )
      )}
    </form>
  )
}
