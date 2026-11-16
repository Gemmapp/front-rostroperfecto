import type { CSSProperties, ReactNode } from 'react'
import { avatarColor } from '@/libreria/marca'
import { recursoUrl } from '@/libreria/api/http'
import { cn } from '@/libreria/clases'
import { inicial } from '@/libreria/formato'

export type Nivel = 'base' | 'plata' | 'oro'
const NivelEstilo: Record<Nivel, { bg: string; etiqueta: string }> = {
  base: { bg: 'var(--muted)', etiqueta: 'BASE' },
  plata: { bg: 'var(--lvl-silver)', etiqueta: 'PLATA' },
  oro: { bg: 'var(--lvl-gold)', etiqueta: 'ORO' },
}
export const nivelNombre = (l: Nivel) => ({ base: 'Base', plata: 'Plata', oro: 'Oro' })[l]

/** Chip de nivel: texto siempre #241A1D. */
export function NivelEtiqueta({ nivel, className }: { nivel: Nivel; className?: string }) {
  return <span className={cn('inline-block rounded-full px-3 py-[5px] text-xs font-bold tracking-[.06em] text-[#241A1D]', className)} style={{ background: NivelEstilo[nivel].bg }}>{NivelEstilo[nivel].etiqueta}</span>
}

export function Pastilla({ children, tono = 'principal', className }: { children: ReactNode; tono?: 'principal' | 'soft' | 'atenuado'; className?: string }) {
  const t = { principal: 'bg-primary text-primary-foreground', soft: 'bg-accent-soft text-foreground', atenuado: 'bg-muted text-foreground' }[tono]
  return <span className={cn('inline-block rounded-full px-3 py-1.5 text-[13px] font-bold', t, className)}>{children}</span>
}

export function Avatar({ nombre, foto, tamanio = 44, tono = 350 }: { nombre: string; foto?: string; tamanio?: number; tono?: number }) {
  const s: CSSProperties = { width: tamanio, height: tamanio, fontSize: tamanio * 0.4, background: foto ? undefined : avatarColor(tono) }
  return (
    <span className="display grid flex-none place-items-center overflow-hidden rounded-full text-[#1F1517]" style={s} aria-hidden="true">
      {foto ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={recursoUrl(foto)} alt="" className="size-full object-cover" /> : inicial(nombre)}
    </span>
  )
}

export function DatoTarjeta({ etiqueta, valor, pista, className, style }: { etiqueta: string; valor: ReactNode; pista?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('flex flex-col gap-1.5 rounded-[22px] border border-border bg-card p-4', className)} style={style}>
      <span className="text-[13px] text-muted-foreground">{etiqueta}</span>
      <span className="display text-[32px] leading-[1.05] tracking-[-.03em]">{valor}</span>
      {pista && <span className="text-[13px] leading-snug text-muted-foreground">{pista}</span>}
    </div>
  )
}

export function ListarFila({ inicio, titulo, subtitulo, final, onClic, href }: {
  inicio?: ReactNode; titulo: ReactNode; subtitulo?: ReactNode; final?: ReactNode; onClic?: () => void; href?: never
}) {
  const body = (
    <>
      {inicio}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="truncate text-base font-medium">{titulo}</span>
        {subtitulo && <span className="text-[13px] text-muted-foreground">{subtitulo}</span>}
      </span>
      {final}
    </>
  )
  const clases = 'flex min-h-16 w-full items-center gap-3.5 rounded-[18px] border border-border bg-card p-3'
  return onClic ? <button type="button" onClick={onClic} className={cn(clases, 'press cursor-pointer text-foreground')}>{body}</button> : <div className={clases}>{body}</div>
}

/** Tarjeta de servicio: vertical, imagen de 150px arriba (placeholder rayado). */
export function ServicioTarjeta({ nombre, precio, sumar, foto, pausado, onClic }: { nombre: string; precio: string; sumar: string; foto?: string; pausado?: boolean; onClic?: () => void }) {
  return (
    <button type="button" onClick={onClic} className="press flex flex-col overflow-hidden rounded-card border border-border bg-card text-left text-foreground">
      <span className="stripes relative block h-[150px] w-full">
        {foto && /* eslint-disable-next-line @next/next/no-img-element */ <img src={recursoUrl(foto)} alt="" className="absolute inset-0 size-full object-cover" />}
        {pausado && <span className="absolute left-2.5 top-2.5 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">Pausado</span>}
      </span>
      <span className="flex flex-col gap-1.5 p-3.5">
        <span className="text-[15px] font-semibold leading-tight">{nombre}</span>
        <span className="display text-[22px] tracking-tight">{precio}</span>
        <span className="self-start rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold">{sumar}</span>
      </span>
    </button>
  )
}

/** Tarjeta del cliente: SIEMPRE oscura, sin degrades ni glows. */
export function FidelidadTarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-client bg-[#2A1D21] p-[22px] text-[#FAF2F3] shadow-[0_26px_44px_-26px_rgba(30,12,18,.7)]', className)}>
      <span aria-hidden="true" className="absolute -right-[70px] -top-[70px] size-[230px] rounded-full border-[1.5px] border-white/10" />
      <span aria-hidden="true" className="absolute -right-[30px] -top-[30px] size-[150px] rounded-full border-[1.5px]" style={{ borderColor: 'color-mix(in oklch, var(--primary) 60%, transparent)' }} />
      <div className="relative">{children}</div>
    </div>
  )
}

/** Fila de sellos del premio por visitas. `done` viene de la API; el ultimo sello es el premio. */
export function SelloFila({ total, hecho }: { total: number; hecho: number }) {
  return (
    <div className="flex gap-1.5" role="img" aria-label={`${hecho} de ${total - 1} visitas`}>
      {Array.from({ length: total }, (_, i) => {
        const ultimo = i === total - 1
        const ok = i < hecho
        return (
          <span key={i} className={cn('grid h-[42px] place-items-center rounded-[14px] text-[13px] font-bold', ultimo ? 'flex-[1.6] border-[1.5px] border-primary-text bg-accent-soft text-foreground' : ok ? 'flex-1 border-[1.5px] border-primary bg-primary text-primary-foreground' : 'flex-1 border-[1.5px] border-dashed border-border text-muted-foreground')}>
            {ultimo ? 'Gratis' : ok ? '✓' : i + 1}
          </span>
        )
      })}
    </div>
  )
}

export function SeccionTitulo({ children }: { children: ReactNode }) {
  return <h2 className="px-0.5 pb-0.5 pt-1.5 text-lg font-semibold tracking-[-.01em]">{children}</h2>
}

/** Indicador discreto: este dato todavia no viene de la API. */
export function EjemploEtiqueta() {
  return <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Datos de ejemplo</span>
}
