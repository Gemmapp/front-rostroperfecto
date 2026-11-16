import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '@/componentes/interfaz/visualizacion'
import { cn } from '@/libreria/clases'
import { rolEtiqueta } from '@/libreria/genero'
import { isDuenio, useSesion } from '@/libreria/sesion'
import { TemaInterruptor } from '@/componentes/interruptor-tema'
import { useSuscripcion } from '@/libreria/suscripcion'

const items = [
  { to: '/panel', etiqueta: 'Inicio' },
  { to: '/panel/clientes', etiqueta: 'Clientes' },
  { to: '/panel/escanear', etiqueta: 'Registrar visita' },
  { to: '/panel/agenda', etiqueta: 'Agenda' },
  { to: '/panel/servicios', etiqueta: 'Servicios' },
  { to: '/panel/reglas', etiqueta: 'Reglas', duenio: true },
  { to: '/panel/empresa', etiqueta: 'Mi empresa', duenio: true },
  { to: '/panel/equipo', etiqueta: 'Mi equipo', duenio: true },
  { to: '/panel/suscripcion', etiqueta: 'Mi suscripción', principal: true },
]

/** Barra lateral fija de escritorio (>= 1024 px): marca del local, secciones, usuario y salir. */
export function BarraLateral() {
  const ruta = useLocation().pathname
  const navegar = useNavigate()
  const { sesion, firmarSalida } = useSesion()
  const suscripcion = useSuscripcion()
  if (!sesion) return null
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[264px] flex-col gap-6 border-r border-border bg-card px-4 py-6 lg:flex">
      <div className="flex flex-col items-center gap-3 px-2 pt-2 text-center">
        <Avatar nombre={sesion.marca.nombre} foto={sesion.marca.logoUrl} tamanio={84} tono={sesion.marca.tono} />
        <span className="display text-[22px] leading-tight tracking-[-.02em]">{sesion.marca.nombre}</span>
      </div>
      {sesion.locales && <Link to="/panel/locales" className="mx-2 -mt-3 text-center text-[13px] font-semibold text-primary-text">Cambiar de local</Link>}
      <nav aria-label="Secciones" className="flex flex-1 flex-col gap-1">
        {items.filter((it) => (!('owner' in it) || isDuenio(sesion)) && (!('primary' in it) || suscripcion)).map((it) => {
          const on = it.to === '/panel' ? ruta === '/panel' : ruta === it.to || ruta.startsWith(it.to + '/')
          return (
            <Link key={it.to} to={it.to} aria-current={on ? 'page' : undefined}
              className={cn('flex h-11 items-center rounded-[14px] px-3.5 text-[15px] font-semibold no-underline transition-colors', on ? 'bg-accent-soft text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              {it.etiqueta}
            </Link>
          )
        })}
      </nav>
      <div className="flex flex-col gap-2 border-t border-border px-2 pt-4">
        <Link to="/panel/perfil" className="flex items-center gap-3 rounded-[14px] p-1 no-underline hover:bg-muted" aria-label="Mi perfil">
          <Avatar nombre={sesion.usuarioNombre} foto={sesion.usuarioFoto} tamanio={40} tono={sesion.marca.tono} />
          <span className="flex min-w-0 flex-col"><span className="truncate text-[15px] font-semibold text-foreground">{sesion.usuarioNombre}</span><span className="text-[13px] text-muted-foreground">{rolEtiqueta(sesion.rol, sesion.usuarioGenero)}</span></span>
        </Link>
        <button type="button" onClick={() => { firmarSalida(); navegar('/panel/login', { replace: true }) }}
          className="h-11 rounded-[14px] border border-border bg-card text-[15px] font-medium text-foreground hover:bg-muted">Salir</button>
        <TemaInterruptor />
      </div>
    </aside>
  )
}
