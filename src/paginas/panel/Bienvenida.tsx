import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { api } from '@/libreria/api/peticiones'
import { cn } from '@/libreria/clases'
import { bienvenida } from '@/libreria/genero'
import { useCargar } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

/** Guia de primeros pasos: cada paso se tacha solo segun lo que el local ya cargo. */
export default function Bienvenida() {
  const { sesion } = useSesion()
  const navegar = useNavigate()
  const recienHecho = (useLocation().state as { recienHecho?: { titulo: string } } | null)?.recienHecho
  const localId = sesion!.localId
  const datos = useCargar(() => api.personal.guia(localId), [localId])
  const o = datos.datos
  async function terminar() {
    try { await api.personal.dismissGuia(localId) } catch { /* si falla igual seguimos */ }
    navegar('/panel', { replace: true })
  }
  const siguiente = o?.pasos.find((s) => !s.cumplidos)
  const estadoFor = (key: string) => { const i = o!.pasos.findIndex((x) => x.clave === key); return { guia: { key, n: i + 1, total: o!.total, titulo: o!.pasos[i].title } } }
  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-10 pt-6 lg:max-w-[640px] lg:px-0 lg:pt-2">
      <h1 className="display text-[36px] leading-none tracking-[-.04em]">{bienvenida(sesion!.usuarioGenero)}, {sesion!.usuarioNombre}</h1>
      <p className="m-0 text-[15px] leading-snug">Dejemos {sesion!.localNombre} listo en pocos pasos. Podés hacerlos en el orden que quieras: se van tachando solos.</p>
      {recienHecho && <Aviso ok>✓ Listo: {recienHecho.titulo}.</Aviso>}
      {datos.error && <Aviso>{datos.error}</Aviso>}
      {o && (
        <>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm font-medium"><span>{o.completados} de {o.total} pasos</span><span>{Math.round((o.completados * 100) / o.total)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={o.completados} aria-valuemax={o.total}><div className="h-full rounded-full bg-primary" style={{ width: `${(o.completados * 100) / o.total}%` }} /></div>
          </div>
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {o.pasos.map((s, i) => (
              <li key={s.clave}>
                <Link to={s.ruta} state={estadoFor(s.clave)} className={cn('flex items-center gap-3 rounded-card border bg-card p-3 no-underline', s.cumplidos ? 'border-border opacity-70' : s.clave === siguiente?.clave ? 'border-primary-text' : 'border-border')}>
                  <span aria-hidden="true" className={cn('grid size-8 flex-none place-items-center rounded-full text-sm font-bold', s.cumplidos ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{s.cumplidos ? '✓' : i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col"><span className={cn('text-[16px] font-semibold text-foreground', s.cumplidos && 'line-through')}>{s.title}</span><span className="text-[13px] text-muted-foreground">{s.pista}</span></span>
                  <span aria-hidden="true" className="text-muted-foreground">›</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2">
            {siguiente && <Boton onClick={() => navegar(siguiente.ruta, { state: estadoFor(siguiente.clave) })}>Seguir con el paso {o.pasos.indexOf(siguiente) + 1}: {siguiente.title}</Boton>}
            <Boton variante="secondary" onClick={terminar}>{o.completados === o.total ? 'Listo, ir al inicio' : 'Hacerlo después'}</Boton>
            <p className="m-0 text-center text-xs text-muted-foreground">Podés volver a esta guía desde el menú de tu usuario.</p>
          </div>
        </>
      )}
    </div>
  )
}
