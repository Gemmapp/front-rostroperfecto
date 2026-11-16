import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AccesoMarco } from '@/componentes/marco-acceso'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Field } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import { errMensaje } from '@/libreria/ganchos'

/** Pide el enlace para elegir una clave nueva. Siempre muestra el mismo mensaje: no revela que cuentas existen. */
export default function Recuperar() {
  const [correo, fijarCorreo] = useState('')
  const [ocupado, fijarOcupado] = useState(false)
  const [enviado, fijarEnviado] = useState(false)
  const [error, fijarError] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    fijarError(null); fijarOcupado(true)
    try { await api.personal.forgotContrasenia(correo.trim()); fijarEnviado(true) } catch (err) { fijarError(errMensaje(err)) } finally { fijarOcupado(false) }
  }

  return (
    <AccesoMarco>
      <div className="flex flex-col gap-1.5">
        <h2 className="display text-[34px] leading-none tracking-[-.035em]">Recuperá tu acceso</h2>
        <p className="m-0 text-[15px] leading-snug text-muted-foreground">Poné tu email y te mandamos un enlace para elegir una clave nueva.</p>
      </div>
      {enviado ? (
        <div className="flex flex-col gap-4" role="status">
          <p className="m-0 rounded-card bg-accent-soft p-4 text-[15px] leading-snug">Si el email corresponde a una cuenta, te enviamos un enlace. Revisá tu bandeja de entrada y la carpeta de spam. El enlace vale 30 minutos.</p>
          <Link to="/panel/login" className="text-center text-sm font-semibold text-primary-text">Volver a ingresar</Link>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-3.5" noValidate>
          <Field etiqueta="Email" type="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="email" value={correo} onChange={(e) => fijarCorreo(e.target.value)} placeholder="vos@tulocal.com" />
          {error && <Aviso>{error}</Aviso>}
          <Boton type="submit" disabled={ocupado || !correo.trim()}>{ocupado ? 'Enviando…' : 'Enviarme el enlace'}</Boton>
          <Link to="/panel/login" className="text-center text-sm font-semibold text-primary-text">Volver a ingresar</Link>
        </form>
      )}
    </AccesoMarco>
  )
}
