import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/libreria/clases'
import { isDuenio, useSesion } from '@/libreria/sesion'

const items = [
  { href: '/panel', etiqueta: 'Inicio' },
  { href: '/panel/clientes', etiqueta: 'Clientes' },
  { href: '/panel/escanear', etiqueta: 'Escanear', center: true },
  { href: '/panel/agenda', etiqueta: 'Agenda' },
  { href: '/panel/servicios', etiqueta: 'Servicios' },
  { href: '/panel/reglas', etiqueta: 'Reglas', duenio: true },
]

/** Navegacion flotante de vidrio, 5 columnas, Escanear central elevado (58px). */
export function FlotanteNav() {
  const ruta = useLocation().pathname
  const { sesion } = useSesion()
  const visible = items.filter((it) => !('owner' in it) || isDuenio(sesion))
  return (
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[420px] px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <ul className="m-0 grid list-none items-end rounded-[26px] border border-border p-1.5 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--card) 80%, transparent)', gridTemplateColumns: `repeat(${visible.length}, 1fr)` }}>
        {visible.map((it) => {
          const on = it.href === '/panel' ? ruta === '/panel' : ruta === it.href || ruta.startsWith(it.href + '/')
          if (it.center)
            return (
              <li key={it.href} className="flex flex-col items-center">
                <Link to={it.href} aria-label="Escanear" aria-current={on ? 'page' : undefined}
                  className="press -mt-7 grid size-[58px] place-items-center rounded-full bg-primary shadow-primary" style={{ color: 'var(--primary-foreground)' }}>
                  <span aria-hidden="true" className="relative block size-6">
                    <span className="absolute left-0 top-0 size-2 rounded-tl-[5px] border-l-[2.5px] border-t-[2.5px] border-current" />
                    <span className="absolute right-0 top-0 size-2 rounded-tr-[5px] border-r-[2.5px] border-t-[2.5px] border-current" />
                    <span className="absolute bottom-0 left-0 size-2 rounded-bl-[5px] border-b-[2.5px] border-l-[2.5px] border-current" />
                    <span className="absolute bottom-0 right-0 size-2 rounded-br-[5px] border-b-[2.5px] border-r-[2.5px] border-current" />
                    <span className="absolute inset-x-1 top-[11px] h-0.5 rounded bg-current" />
                  </span>
                </Link>
                <span className="pb-1 pt-0.5 text-[11px] font-medium text-muted-foreground">Escanear</span>
              </li>
            )
          return (
            <li key={it.href}>
              <Link to={it.href} aria-current={on ? 'page' : undefined}
                className={cn('flex min-h-[52px] items-center justify-center rounded-[20px] text-[13px] font-semibold no-underline', on ? 'bg-accent-soft text-foreground' : 'text-muted-foreground')}>
                {it.etiqueta}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
