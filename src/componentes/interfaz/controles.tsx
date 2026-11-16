import { cn } from '@/libreria/clases'

/** Switch 52x32. */
export function Interruptor({ marcado, onCambiar, etiqueta }: { marcado: boolean; onCambiar: (v: boolean) => void; etiqueta: string }) {
  return (
    <button type="button" role="switch" aria-checked={marcado} aria-label={etiqueta} onClick={() => onCambiar(!marcado)}
      className={cn('relative h-8 w-[52px] flex-none rounded-full transition-colors duration-200', marcado ? 'bg-primary-text' : 'bg-muted')}>
      <span className="absolute top-1 size-6 rounded-full bg-white transition-[left] duration-200" style={{ left: marcado ? 24 : 4 }} />
    </button>
  )
}

/** Segmented: contenedor 14px, items 11px. */
export function Segmentado<T extends string | number>({ valor, onCambiar, opciones, etiqueta, inverso }: {
  valor: T; onCambiar: (v: T) => void; opciones: { valor: T; etiqueta: string }[]; etiqueta: string; inverso?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className={cn('grid gap-1 rounded-[14px] p-1', inverso ? 'bg-[rgba(127,127,127,.28)]' : 'bg-muted')} style={{ gridTemplateColumns: `repeat(${opciones.length}, 1fr)` }}>
      {opciones.map((o) => {
        const on = o.valor === valor
        return (
          <button key={String(o.valor)} type="button" role="radio" aria-checked={on} onClick={() => onCambiar(o.valor)}
            className={cn('h-11 rounded-[11px] text-sm font-semibold transition-colors', on ? (inverso ? 'bg-background text-foreground' : 'seg-on bg-card text-foreground shadow-[0_2px_6px_rgba(40,20,26,.18)]') : 'bg-transparent text-inherit')}>
            {o.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

/** Stepper: boton - / valor / boton + de 44px. */
export function Contador({ etiqueta, valor, onCambiar, min, max, paso = 1, formato, deshabilitado }: {
  deshabilitado?: boolean; etiqueta: string; valor: number; onCambiar: (v: number) => void; min: number; max: number; paso?: number; formato?: (v: number) => string
}) {
  const fijar = (v: number) => onCambiar(Math.max(min, Math.min(max, v)))
  const boton = 'grid size-11 place-items-center rounded-full border border-border bg-card text-[22px] font-semibold text-foreground disabled:opacity-40 press'
  return (
    <div className={cn('flex items-center justify-between gap-3 py-2 transition-opacity', deshabilitado && 'opacity-45')} role="group" aria-label={etiqueta} aria-disabled={deshabilitado || undefined}>
      <span className="text-base font-semibold">{etiqueta}</span>
      <div className="flex items-center gap-3">
        <button type="button" className={boton} aria-label={`Bajar ${etiqueta}`} disabled={deshabilitado || valor <= min} onClick={() => fijar(valor - paso)}>−</button>
        <span className="display tnum min-w-[64px] text-center text-[26px] tracking-tight" aria-live="polite">{formato ? formato(valor) : valor}</span>
        <button type="button" className={boton} aria-label={`Subir ${etiqueta}`} disabled={deshabilitado || valor >= max} onClick={() => fijar(valor + paso)}>+</button>
      </div>
    </div>
  )
}
