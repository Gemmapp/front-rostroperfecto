import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Field } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import { errMensaje } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

/** Primer ingreso con clave provisoria (o cambio voluntario): el servidor bloquea todo lo demas hasta que se cambie. */
export default function CambiarClave() {
  const { sesion, actualizar, firmarSalida } = useSesion()
  const navegar = useNavigate()
  const forzado = sesion?.debeCambiarContrasenia === true
  const [actual, fijarActual] = useState('')
  const [siguiente, fijarSiguiente] = useState('')
  const [otraVez, fijarOtraVez] = useState('')
  const [ocupado, fijarOcupado] = useState(false)
  const [error, fijarError] = useState<string | null>(null)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    fijarError(null)
    if (siguiente.length < 8) return fijarError('La clave nueva debe tener al menos 8 caracteres.')
    if (siguiente !== otraVez) return fijarError('Las dos claves nuevas no coinciden.')
    fijarOcupado(true)
    try {
      await api.personal.cambiarContrasenia(actual, siguiente)
      actualizar({ debeCambiarContrasenia: false })
      navegar('/panel', { replace: true })
    } catch (err) { fijarError(errMensaje(err)) } finally { fijarOcupado(false) }
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-[18px] px-[18px] pb-10 pt-6 lg:max-w-[520px] lg:px-0">
      <h1 className="display text-[36px] leading-none tracking-[-.04em]">{forzado ? 'Elegí tu clave' : 'Cambiar mi clave'}</h1>
      {forzado && <p className="m-0 text-[15px] leading-snug">Entraste con una clave provisoria. Para cuidar tu cuenta y los datos de tus clientes, elegí una clave propia antes de seguir.</p>}
      <Field etiqueta={forzado ? 'Clave provisoria' : 'Clave actual'} type="password" autoComplete="current-password" value={actual} onChange={(e) => fijarActual(e.target.value)} />
      <Field etiqueta="Clave nueva" type="password" autoComplete="new-password" pista="Al menos 8 caracteres. No uses 12345678 ni 123123123." value={siguiente} onChange={(e) => fijarSiguiente(e.target.value)} />
      <Field etiqueta="Repetí la clave nueva" type="password" autoComplete="new-password" value={otraVez} onChange={(e) => fijarOtraVez(e.target.value)} />
      {error && <Aviso>{error}</Aviso>}
      <Boton type="submit" disabled={ocupado || !actual || !siguiente || !otraVez}>{ocupado ? 'Guardando…' : 'Guardar clave'}</Boton>
      {forzado && <Boton variante="secondary" onClick={firmarSalida}>Salir</Boton>}
    </form>
  )
}
