import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { Boton } from '@/componentes/interfaz/boton'
import { AccesoMarco } from '@/componentes/marco-acceso'
import { Field } from '@/componentes/interfaz/campo'
import { ApiError } from '@/libreria/api/http'
import { obtenerOrigen } from '@/libreria/datos'
import { useSesion } from '@/libreria/sesion'

export default function IngresoPagina() {
  const navegar = useNavigate()
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso
  const { sesion, listo, firmarIn } = useSesion()
  const [correo, fijarCorreo] = useState('')
  const [contrasenia, fijarContrasenia] = useState('')
  const [ocupado, fijarOcupado] = useState(false)
  const [error, fijarError] = useState<string | null>(null)

  useEffect(() => { if (listo && sesion) navegar('/panel', { replace: true }) }, [listo, sesion, navegar])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    fijarError(null)
    fijarOcupado(true)
    try {
      firmarIn(await obtenerOrigen().ingreso(correo.trim(), contrasenia))
      navegar('/panel', { replace: true })
    } catch (err) {
      fijarError(err instanceof ApiError && err.estado === 429 ? 'Demasiados intentos. Esperá unos minutos y probá de nuevo.' : err instanceof ApiError && err.estado === 0 ? err.userMessage : 'Revisá la contraseña y probá de nuevo.')
    } finally { fijarOcupado(false) }
  }

  const soporte = import.meta.env.VITE_SUPPORT_URL ?? 'mailto:soporte@example.com'
  return (
    <AccesoMarco>
      <div className="flex flex-col gap-1.5">
        <h2 className="display text-[34px] leading-none tracking-[-.035em]">Ingresá a tu panel</h2>
        <p className="m-0 text-[15px] leading-snug text-muted-foreground">Con tu usuario y tu contraseña.</p>
      </div>
      {aviso && <p role="status" className="m-0 rounded-card bg-accent-soft p-3.5 text-[15px] font-medium">{aviso}</p>}
      <form onSubmit={enviar} className="flex flex-col gap-3.5" noValidate>
        <Field etiqueta="Usuario o email" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" value={correo} onChange={(e) => fijarCorreo(e.target.value)} placeholder="vos@tulocal.com" />
        <Field etiqueta="Contraseña" type="password" autoComplete="current-password" value={contrasenia} onChange={(e) => fijarContrasenia(e.target.value)} error={error ?? undefined} />
        <Link to="/panel/recuperar" className="self-end text-sm font-semibold text-primary-text">¿Olvidaste tu contraseña?</Link>
        <Boton type="submit" disabled={ocupado || !correo}>{ocupado ? 'Entrando…' : 'Entrar'}</Boton>
      </form>
      <p className="m-0 text-center text-sm text-muted-foreground">¿Necesitás ayuda? <a className="font-semibold text-primary-text" href={soporte}>Escribinos</a>.</p>
    </AccesoMarco>
  )
}
