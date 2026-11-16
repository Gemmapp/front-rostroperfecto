import { useId, useState, type ComponentProps } from 'react'
import { cn } from '@/libreria/clases'

interface FieldProps extends Omit<ComponentProps<'input'>, 'size'> {
  etiqueta: string
  error?: string
  pista?: string
}

const Ojo = 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z'

/** Ojito para mostrar u ocultar lo que se escribe en un campo de clave. */
function OjoBoton({ mostrado, onInterruptor }: { mostrado: boolean; onInterruptor: () => void }) {
  return (
    <button type="button" onClick={onInterruptor} aria-label={mostrado ? 'Ocultar clave' : 'Mostrar clave'} aria-pressed={mostrado}
      className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={Ojo} /><circle cx="12" cy="12" r="3" />
        {mostrado && <path d="M3 3l18 18" />}
      </svg>
    </button>
  )
}

/** Campo con la etiqueta adentro (66px). Foco: borde + halo (clase .fld). Los de clave llevan ojito para ver lo escrito. */
export function Field({ etiqueta, error, pista, className, type, ...p }: FieldProps) {
  const id = useId()
  const [mostrado, fijarMostrado] = useState(false)
  const isContrasenia = type === 'password'
  const desc = error ? `${id}-e` : pista ? `${id}-h` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <label
          htmlFor={id}
          className={cn('fld flex h-[66px] cursor-text flex-col justify-center gap-0.5 rounded-field border-[1.5px] bg-card px-[18px]', isContrasenia && 'pr-14', error ? 'border-destructive' : 'border-border', className)}
        >
          <span className="text-xs font-medium text-muted-foreground">{etiqueta}</span>
          <input id={id} type={isContrasenia && mostrado ? 'text' : type} aria-invalid={error ? true : undefined} aria-describedby={desc} className="h-7 w-full border-0 bg-transparent p-0 text-[17px] font-medium text-foreground outline-none placeholder:text-muted-foreground/60" {...p} />
        </label>
        {isContrasenia && <OjoBoton mostrado={mostrado} onInterruptor={() => fijarMostrado((v) => !v)} />}
      </div>
      {error ? <span id={`${id}-e`} role="alert" className="text-[13px] font-medium text-destructive">{error}</span> : pista ? <span id={`${id}-h`} className="text-[13px] text-muted-foreground">{pista}</span> : null}
    </div>
  )
}

export function TextoArea({ etiqueta, className, ...p }: ComponentProps<'textarea'> & { etiqueta: string }) {
  const id = useId()
  return (
    <label htmlFor={id} className={cn('fld flex cursor-text flex-col gap-1 rounded-field border-[1.5px] border-border bg-card px-[18px] py-3', className)}>
      <span className="text-xs font-medium text-muted-foreground">{etiqueta}</span>
      <textarea id={id} rows={2} className="w-full resize-none border-0 bg-transparent p-0 text-[17px] font-medium text-foreground outline-none" {...p} />
    </label>
  )
}

/** Selector con la etiqueta adentro (66px), mismo estilo que Field. */
export function ElegirCaja({ etiqueta, children, className, ...p }: ComponentProps<'select'> & { etiqueta: string }) {
  const id = useId()
  return (
    <label htmlFor={id} className={cn('fld flex h-[66px] cursor-pointer flex-col justify-center gap-0.5 rounded-field border-[1.5px] border-border bg-card px-[18px]', className)}>
      <span className="text-xs font-medium text-muted-foreground">{etiqueta}</span>
      <select id={id} className="h-7 w-full cursor-pointer border-0 bg-transparent p-0 text-[17px] font-medium text-foreground outline-none" {...p}>{children}</select>
    </label>
  )
}
