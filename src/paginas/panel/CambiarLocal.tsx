import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/componentes/interfaz/visualizacion'
import { cn } from '@/libreria/clases'
import { useSesion } from '@/libreria/sesion'

/** Elegir de que local ver el panel (para quien tiene acceso a varios: el soporte del sistema). */
export default function CambiarLocal() {
  const { sesion, actualizar } = useSesion()
  const navegar = useNavigate()
  const locales = [...(sesion?.locales ?? [])].sort((a, b) => a.localNombre.localeCompare(b.localNombre, 'es'))
  if (!sesion || locales.length === 0) { navegar('/panel', { replace: true }); return null }

  function elegir(localId: string) {
    const l = locales.find((x) => x.localId === localId)!
    actualizar({ localId: l.localId, localNombre: l.localNombre, rol: l.rol, marca: { nombre: l.localNombre, tono: 350 } })
    navegar('/panel', { replace: true })
  }

  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-10 pt-4 lg:px-0 lg:pt-2">
      <h1 className="display text-[42px] leading-none tracking-[-.04em]">Mis locales</h1>
      <p className="m-0 max-w-[560px] text-[15px] leading-snug text-muted-foreground">Elegí el local que querés ver. Como soporte del sistema ves todo, pero no podés modificar nada.</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 lg:max-w-[640px]">
        {locales.map((l) => (
          <li key={l.localId}>
            <button type="button" onClick={() => elegir(l.localId)}
              className={cn('flex w-full items-center gap-3 rounded-card border bg-card p-3 text-left hover:bg-muted', l.localId === sesion.localId ? 'border-primary-text' : 'border-border')}>
              <Avatar nombre={l.localNombre} tamanio={44} tono={sesion.marca.tono} />
              <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[16px] font-semibold">{l.localNombre}</span><span className="text-[13px] text-muted-foreground">{l.rol === 'SOPORTE' ? 'Solo lectura' : 'Tu local'}</span></span>
              {l.localId === sesion.localId && <span className="text-sm font-semibold text-primary-text">Viendo</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
