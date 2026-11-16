import { useEffect, useState } from 'react'
import { api } from '@/libreria/api/peticiones'
import { cn } from '@/libreria/clases'
import { agregarDias, diaCorto, hoyISO } from '@/libreria/fechas'
import { errMensaje } from '@/libreria/ganchos'

/** Elegir dia y horario libre de un servicio. `bookingRef` = nombre de la pagina publica o id del local. */
export function HorarioSelector({ reservaRef, servicioId, dias = 14, valor, onCambiar }: { reservaRef: string; servicioId: string | undefined; dias?: number; valor: { fecha: string; hora: string }; onCambiar: (v: { fecha: string; hora: string }) => void }) {
  const [horas, fijarHoras] = useState<string[] | null>(null)
  const [error, fijarError] = useState<string | null>(null)
  const [offset, fijarOffset] = useState(0)
  const tira = Array.from({ length: 7 }, (_, i) => agregarDias(hoyISO(), offset + i)).filter((_, i) => offset + i < dias)

  useEffect(() => {
    if (!servicioId || !valor.fecha) { fijarHoras(null); return }
    let vivo = true
    fijarError(null); fijarHoras(null)
    api.reserva.availability(reservaRef, servicioId, valor.fecha).then((r) => vivo && fijarHoras(r.horas)).catch((e) => vivo && fijarError(errMensaje(e)))
    return () => { vivo = false }
  }, [reservaRef, servicioId, valor.fecha])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <button type="button" aria-label="Días anteriores" disabled={offset === 0} onClick={() => fijarOffset(Math.max(0, offset - 7))} className="size-11 flex-none rounded-full border border-border bg-card text-lg disabled:opacity-40">‹</button>
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto" role="group" aria-label="Día">
          {tira.map((d) => (
            <button key={d} type="button" aria-pressed={valor.fecha === d} onClick={() => onCambiar({ fecha: d, hora: '' })}
              className={cn('min-h-12 min-w-[58px] flex-1 rounded-[14px] border px-2 text-[13px] font-semibold capitalize', valor.fecha === d ? 'border-primary-text bg-accent-soft' : 'border-border bg-card')}>{diaCorto(d)}</button>
          ))}
        </div>
        <button type="button" aria-label="Días siguientes" disabled={offset + 7 >= dias} onClick={() => fijarOffset(offset + 7)} className="size-11 flex-none rounded-full border border-border bg-card text-lg disabled:opacity-40">›</button>
      </div>
      {!servicioId && <p className="m-0 text-sm text-muted-foreground">Primero elegí un servicio.</p>}
      {error && <p role="alert" className="m-0 text-sm font-medium text-destructive">{error}</p>}
      {servicioId && valor.fecha && horas && horas.length === 0 && <p className="m-0 text-sm text-muted-foreground">No hay horarios libres ese día. Probá con otro.</p>}
      {horas && horas.length > 0 && (
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Horario">
          {horas.map((t) => (
            <button key={t} type="button" aria-pressed={valor.hora === t} onClick={() => onCambiar({ ...valor, hora: t })}
              className={cn('min-h-11 rounded-[12px] border text-[15px] font-semibold', valor.hora === t ? 'border-primary-text bg-primary text-primary-foreground' : 'border-border bg-card')}>{t}</button>
          ))}
        </div>
      )}
    </div>
  )
}
