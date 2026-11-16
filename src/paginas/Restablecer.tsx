import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AccesoMarco } from '@/componentes/marco-acceso'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Field } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import { ApiError } from '@/libreria/api/http'
import { errMensaje } from '@/libreria/ganchos'

/** Pantalla a la que llega el enlace del mail: elegir la clave nueva. */
export default function Restablecer() {
  const token = useSearchParams()[0].get('token') ?? ''
  const navegar = useNavigate()
  const [clave, fijarClave] = useState('')
  const [repetida, fijarRepetida] = useState('')
  const [ocupado, fijarOcupado] = useState(false)
  const [error, fijarError] = useState<string | null>(null)
  const [vencido, fijarVencido] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    fijarError(null)
    if (clave.length < 8) return fijarError('La clave debe tener al menos 8 caracteres.')
    if (clave !== repetida) return fijarError('Las dos claves no coinciden.')
    fijarOcupado(true)
    try {
      await api.personal.resetContrasenia(token, clave)
      navegar('/panel/login', { replace: true, state: { aviso: 'Listo, ya podés ingresar con tu clave nueva.' } })
    } catch (err) {
      if (err instanceof ApiError && err.problema.codigo === 'ENLACE_NO_VALIDO') fijarVencido(true)
      else fijarError(errMensaje(err))
    } finally { fijarOcupado(false) }
  }

  if (!token || vencido) {
    return (
      <AccesoMarco>
        <div className="flex flex-col gap-1.5">
          <h2 className="display text-[34px] leading-none tracking-[-.035em]">El enlace ya no sirve</h2>
          <p className="m-0 text-[15px] leading-snug text-muted-foreground">Venció o ya se usó. Pedí uno nuevo y te lo mandamos al instante.</p>
        </div>
        <Link to="/panel/recuperar"><Boton>Pedir un enlace nuevo</Boton></Link>
      </AccesoMarco>
    )
  }
  return (
    <AccesoMarco>
      <div className="flex flex-col gap-1.5">
        <h2 className="display text-[34px] leading-none tracking-[-.035em]">Elegí tu clave nueva</h2>
        <p className="m-0 text-[15px] leading-snug text-muted-foreground">Mínimo 8 caracteres. Después ingresás con ella.</p>
      </div>
      <form onSubmit={enviar} className="flex flex-col gap-3.5" noValidate>
        <Field etiqueta="Clave nueva" type="password" autoComplete="new-password" value={clave} onChange={(e) => fijarClave(e.target.value)} />
        <Field etiqueta="Repetí la clave" type="password" autoComplete="new-password" value={repetida} onChange={(e) => fijarRepetida(e.target.value)} />
        {error && <Aviso>{error}</Aviso>}
        <Boton type="submit" disabled={ocupado || !clave}>{ocupado ? 'Guardando…' : 'Guardar clave nueva'}</Boton>
      </form>
    </AccesoMarco>
  )
}
