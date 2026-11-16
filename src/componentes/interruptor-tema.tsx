import { useEffect, useState } from 'react'
import { aplicarTema, obtenerTema } from '@/componentes/proveedores'
import { cn } from '@/libreria/clases'

const Sol = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)
const Luna = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

/** Interruptor de tono claro/oscuro con iconos de sol y luna. */
export function TemaInterruptor({ className }: { className?: string }) {
  const [tema, fijarTema] = useState<'light' | 'dark'>('light')
  useEffect(() => fijarTema(obtenerTema()), [])
  const fijar = (t: 'light' | 'dark') => { fijarTema(t); aplicarTema(t) }
  return (
    <div role="group" aria-label="Tono de la aplicación" className={cn('flex h-11 items-center gap-1 rounded-full border border-border bg-muted p-1', className)}>
      {([['light', <Sol key="s" />, 'Tono claro'], ['dark', <Luna key="l" />, 'Tono oscuro']] as const).map(([t, icono, etiqueta]) => (
        <button key={t} type="button" aria-pressed={tema === t} aria-label={etiqueta} title={etiqueta} onClick={() => fijar(t)}
          className={cn('grid h-9 flex-1 place-items-center rounded-full transition-colors', tema === t ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground')}>{icono}</button>
      ))}
    </div>
  )
}
