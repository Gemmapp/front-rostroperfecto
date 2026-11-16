import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Field } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import { tonoDesdeColor } from '@/libreria/marca'
import { cn } from '@/libreria/clases'
import { obtenerOrigen } from '@/libreria/datos'
import { GeneroOpciones, type Genero } from '@/libreria/genero'
import { errMensaje } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

export const OmitirClave = 'fidelapp.setup.skip'

/** Primer ingreso del dueño principal: nombre de la empresa, su nombre y como quiere que lo traten (nunca se adivina). */
export default function ConfigInicial() {
  const { sesion, actualizar } = useSesion()
  const navegar = useNavigate()
  const [empresa, fijarEmpresa] = useState(sesion!.localNombre)
  const [nombre, fijarNombre] = useState(sesion!.usuarioCompletoNombre ?? sesion!.usuarioNombre)
  const [genero, fijarGenero] = useState<Genero>(sesion!.usuarioGenero ?? null)
  const [ocupado, fijarOcupado] = useState(false)
  const [error, fijarError] = useState<string | null>(null)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    fijarError(null)
    if (empresa.trim().length < 2) return fijarError('Poné el nombre de tu empresa.')
    if (nombre.trim().length < 2) return fijarError('Poné tu nombre.')
    if (!genero) return fijarError('Elegí una opción (podés elegir "Prefiero no decirlo").')
    fijarOcupado(true)
    try {
      const origen = obtenerOrigen()
      const actual = await origen.obtenerEmpresa(sesion!)
      const guardado = await origen.guardarEmpresa(sesion!, { ...actual, nombre: empresa.trim() })
      const u = await api.personal.actualizarMe({ nombre: nombre.trim(), genero: genero })
      actualizar({ localNombre: guardado.nombre, marca: { nombre: guardado.nombre, logoUrl: guardado.logoUrl, tono: tonoDesdeColor(guardado.acentoColor, sesion!.marca.tono) }, usuarioNombre: u.nombre.split(' ')[0], usuarioCompletoNombre: u.nombre, usuarioGenero: u.genero ?? genero })
      navegar('/panel', { replace: true })
    } catch (err) { fijarError(errMensaje(err)) } finally { fijarOcupado(false) }
  }

  function masTarde() {
    try { sessionStorage.setItem(OmitirClave, '1') } catch { /* sin storage */ }
    navegar('/panel', { replace: true })
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-[18px] px-[18px] pb-10 pt-6 lg:max-w-[560px] lg:px-0">
      <h1 className="display text-[36px] leading-none tracking-[-.04em]">Contanos de vos y tu empresa</h1>
      <p className="m-0 text-[15px] leading-snug">Con esto armamos tu panel y los textos. Lo podés cambiar cuando quieras en "Mi empresa" y "Mi perfil".</p>
      <Field etiqueta="Nombre de tu empresa" autoComplete="organization" value={empresa} onChange={(e) => fijarEmpresa(e.target.value)} />
      <Field etiqueta="Tu nombre" autoComplete="name" value={nombre} onChange={(e) => fijarNombre(e.target.value)} />
      <div className="flex flex-col gap-2" role="group" aria-label="Cómo querés que te tratemos">
        <span className="text-sm text-muted-foreground">¿Cómo querés que te tratemos en los textos?</span>
        <div className="flex flex-col gap-2 md:flex-row">
          {GeneroOpciones.map((o) => (
            <button key={o.valor} type="button" aria-pressed={genero === o.valor} onClick={() => fijarGenero(o.valor)}
              className={cn('min-h-11 flex-1 rounded-card border px-3 py-2 text-left', genero === o.valor ? 'border-primary-text bg-accent-soft' : 'border-border bg-card')}>
              <span className="block text-[15px] font-semibold">{o.etiqueta}</span><span className="block text-[13px] text-muted-foreground">{o.pista}</span>
            </button>
          ))}
        </div>
      </div>
      {error && <Aviso>{error}</Aviso>}
      <Boton type="submit" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Guardar y seguir'}</Boton>
      <Boton variante="secondary" onClick={masTarde}>Más tarde</Boton>
    </form>
  )
}
