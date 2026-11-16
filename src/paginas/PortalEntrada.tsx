import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Field } from '@/componentes/interfaz/campo'
import { marcaEstilo } from '@/libreria/marca'
import { api } from '@/libreria/api/peticiones'
import { ApiError } from '@/libreria/api/http'
import type { PortalLocal } from '@/libreria/api/tipos'
import { dniDigitos, dniFormato } from '@/libreria/formato'
import { restaurarClienteSesion, fijarClienteSesion } from '@/libreria/portal'

export default function PortalEntrada() {
  const { localId } = useParams() as { localId: string }
  const navegar = useNavigate()
  const [local, fijarLocal] = useState<PortalLocal | null>(null)
  const [modo, fijarModo] = useState<'login' | 'register'>('login')
  const [f, fijarF] = useState({ dni: '', pin: '', name: '', contacto: '' })
  const [error, fijarError] = useState<string | null>(null)
  const [ocupado, fijarOcupado] = useState(false)

  useEffect(() => {
    if (restaurarClienteSesion(localId)) { navegar(`/l/${localId}/cuenta`, { replace: true }); return }
    api.portal.local(localId).then(fijarLocal).catch((e) => fijarError(e instanceof ApiError && e.estado === 404 ? 'Este local no existe.' : 'No pudimos cargar el local.'))
  }, [localId, navegar])

  async function enviar(e: FormEvent) {
    e.preventDefault(); fijarOcupado(true); fijarError(null)
    try {
      const res = modo === 'login'
        ? await api.portal.ingreso(localId, f.dni, f.pin)
        : await api.portal.registrar(localId, { dni: f.dni, pin: f.pin, nombre: f.name.trim(), contacto: f.contacto.trim() })
      fijarClienteSesion(localId, res.tokenAcceso)
      navegar(`/l/${localId}/cuenta`, { replace: true })
    } catch (err) {
      if (!(err instanceof ApiError)) fijarError('Algo salió mal. Probá de nuevo.')
      else if (err.estado === 429) fijarError('Demasiados intentos. Esperá 15 minutos antes de volver a probar.')
      else if (err.estado === 401) fijarError('DNI o PIN incorrectos.')
      else if (err.estado === 409) fijarError('Ese DNI ya tiene un PIN. Ingresá con tu DNI y tu PIN.')
      else fijarError(err.userMessage)
    } finally { fijarOcupado(false) }
  }
  const fijar = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => fijarF({ ...f, [k]: k === 'dni' ? dniDigitos(e.target.value) : e.target.value })

  return (
    <div style={marcaEstilo(350)} className="brand-scope min-h-dvh bg-background">
      <main className="mx-auto flex w-full max-w-[420px] flex-col gap-6 px-[22px] pb-8 pt-[54px]">
        <div className="flex flex-col gap-2">
          <h1 className="display text-[40px] leading-none tracking-[-.035em]">{local ? `Tus puntos en ${local.nombre}` : 'Tus puntos'}</h1>
          <p className="text-base leading-snug text-muted-foreground">{modo === 'login' ? 'Ingresá con tu DNI y tu PIN.' : 'Creá tu cuenta con un PIN que puedas recordar.'}</p>
        </div>
        <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
          <Field etiqueta="DNI" inputMode="numeric" autoComplete="off" placeholder="38.455.210" value={dniFormato(f.dni)} onChange={fijar('dni')} />
          {modo === 'register' && <><Field etiqueta="Nombre" value={f.name} onChange={fijar('name')} /><Field etiqueta="WhatsApp o email" value={f.contacto} onChange={fijar('contacto')} /></>}
          <Field etiqueta="PIN" type="password" inputMode="numeric" autoComplete={modo === 'login' ? 'current-password' : 'new-password'} value={f.pin} onChange={fijar('pin')} />
          {error && <Aviso>{error}</Aviso>}
          <div className="flex flex-col gap-1 pt-1">
            <Boton type="submit" disabled={ocupado || !local || f.dni.length < 7 || !f.pin}>{ocupado ? 'Entrando…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}</Boton>
            <Boton variante="texto" tamanio="md" onClick={() => { fijarModo(modo === 'login' ? 'register' : 'login'); fijarError(null) }}>{modo === 'login' ? 'Es mi primera vez' : 'Ya tengo cuenta'}</Boton>
          </div>
        </form>
      </main>
    </div>
  )
}
