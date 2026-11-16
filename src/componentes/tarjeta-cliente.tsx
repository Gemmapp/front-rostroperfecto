import { useEffect, useState } from 'react'
import { QrCodigo } from '@/componentes/codigo-qr'
import { Avatar, NivelEtiqueta, FidelidadTarjeta, SelloFila } from '@/componentes/interfaz/visualizacion'
import { marcaEstilo } from '@/libreria/marca'
import type { TarjetaVista } from '@/libreria/datos/tipos'
import { ars, arsFirmado, largoFecha, num } from '@/libreria/formato'
import { useCantidadUp } from '@/libreria/ganchos'

const nivelEtiqueta = (l?: string) => (({ base: 'Base', plata: 'Plata', oro: 'Oro' }) as Record<string, string>)[l ?? ''] ?? ''

/** Tarjeta del cliente (sin login). Todo viene de `view` (API): aca no se calcula nada. */
export function ClienteTarjetaPantalla({ vista }: { vista: TarjetaVista }) {
  const saldo = useCantidadUp(vista.saldo, 1100, 300)
  const [pct, fijarPct] = useState(0)
  useEffect(() => { const t = setTimeout(() => fijarPct(vista.siguienteNivel?.porcentaje ?? 0), 300); return () => clearTimeout(t) }, [vista.siguienteNivel?.porcentaje])
  const nl = vista.siguienteNivel
  const st = vista.sellos
  const resta = st?.habilitado && st.total !== undefined && st.hecho !== undefined ? st.total - st.hecho - 1 : 0

  return (
    <div style={marcaEstilo(vista.marcaTono)} className="brand-scope min-h-dvh bg-background">
      <main className="mx-auto flex w-full max-w-[420px] flex-col gap-[18px] px-[18px] pb-10 pt-6">
        <header className="rise flex items-center justify-between">
          <div className="flex flex-col gap-0.5"><span className="text-sm text-muted-foreground">Hola,</span><h1 className="display text-[32px] leading-none tracking-[-.03em]">{vista.firstNombre}</h1></div>
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3.5"><Avatar nombre={vista.localNombre} foto={vista.localLogo} tamanio={30} tono={vista.marcaTono} /><span className="text-sm font-semibold">{vista.localNombre}</span></div>
        </header>

        <FidelidadTarjeta className="rise flex flex-col gap-[30px]">
          <div className="flex items-center justify-between"><span className="text-[13px] font-medium text-[#FAF2F3]/70">Tarjeta de cliente</span>{vista.nivel && <NivelEtiqueta nivel={vista.nivel} />}</div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] text-[#FAF2F3]/70">{vista.puntos !== undefined ? 'Tus puntos' : 'Para usar en tu próxima visita'}</span>
            {vista.puntos !== undefined
              ? <span className="display tnum text-[78px] leading-[.88] tracking-[-.04em]">{num(vista.puntos)}</span>
              : <span className="display tnum text-[78px] leading-[.88] tracking-[-.04em]" aria-label={ars(vista.saldo)}>{ars(saldo)}</span>}
            {vista.puntos !== undefined && <span className="mt-1.5 self-start rounded-full bg-white/10 px-3 py-1.5 text-[13px]">equivalen a {ars(vista.saldo)}</span>}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-[3px]"><span className="text-lg font-semibold tracking-[-.01em]">{vista.clienteNombre}</span>{vista.desde && <span className="text-[13px] text-[#FAF2F3]/65">Cliente desde {new Date(vista.desde).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>}</div>
            <QrCodigo valor={vista.qrValor} etiqueta="Código QR personal para mostrar en el local" />
          </div>
        </FidelidadTarjeta>

        {nl && nl.nombre && (
          <section className="rise flex flex-col gap-3.5 rounded-card border border-border bg-card p-5" style={{ ['--i' as string]: 3 }}>
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-[3px]"><span className="text-[13px] text-muted-foreground">Próximo nivel</span><span className="display text-[26px] tracking-[-.02em]">{nl.nombre}</span></div>
              {nl.falta !== undefined && <span className="text-sm font-semibold">Faltan <span className="text-primary-text">{ars(nl.falta)}</span></span>}
            </div>
            <div className="h-3 rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(nl.porcentaje)} aria-label={`Progreso hacia ${nl.nombre}`}>
              <div className="h-full rounded-full bg-primary transition-[width] duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)]" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground"><span className="text-foreground">{nivelEtiqueta(vista.nivel)} · estás acá</span><span>{nl.nombre}</span></div>
            {vista.nivelBonusPct ? <span className="text-[13px] leading-snug text-muted-foreground">Tu nivel suma un {vista.nivelBonusPct}% extra en cada visita.</span> : null}
          </section>
        )}
        {vista.siguienteNivel && !vista.siguienteNivel.nombre && vista.nivel === 'oro' && (
          <p className="rise rounded-card bg-accent-soft p-4 text-sm font-medium" style={{ ['--i' as string]: 3 }}>Llegaste al nivel más alto. Gracias por volver.</p>
        )}

        {st?.habilitado && st.total !== undefined && st.hecho !== undefined && (
          <section className="rise flex flex-col gap-3.5 rounded-card border border-border bg-card p-5" style={{ ['--i' as string]: 4 }}>
            <div className="flex flex-col gap-[3px]"><span className="text-[13px] text-muted-foreground">Tu próximo premio</span><span className="display text-2xl leading-tight tracking-[-.02em]">{st.premioNombre ?? 'Servicio'} gratis</span></div>
            <SelloFila total={st.total} hecho={st.hecho} />
            <span className="text-[13px] text-muted-foreground">Venís {st.hecho} {st.hecho === 1 ? 'vez' : 'veces'}. {st.desbloqueadoSiguiente ? 'Tu próxima visita desbloquea el premio.' : resta === 1 ? 'Te falta 1 visita para tu premio.' : `Te faltan ${resta} visitas para tu premio.`}</span>
          </section>
        )}

        {vista.porVencer && (
          <div className="rise flex items-center gap-3 rounded-[20px] bg-accent-soft px-4 py-3.5" style={{ ['--i' as string]: 5 }}>
            <span className="size-2.5 flex-none rounded-full bg-primary-text" aria-hidden="true" />
            <span className="text-sm leading-snug"><strong className="font-semibold">{ars(vista.porVencer.monto)} vencen el {largoFecha(vista.porVencer.fecha)}.</strong> Usalos en tu próxima visita.</span>
          </div>
        )}

        <section className="rise flex flex-col gap-1" style={{ ['--i' as string]: 6 }}>
          <h2 className="px-0.5 pb-1.5 pt-2 text-lg font-semibold tracking-[-.01em]">Movimientos</h2>
          {vista.movimientos.length === 0 && <p className="text-sm text-muted-foreground">Todavía no tenés movimientos.</p>}
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {vista.movimientos.map((m) => (
              <li key={m.id} className="flex min-h-16 items-center gap-3.5 rounded-[18px] border border-border bg-card p-3">
                <span className="display grid size-10 flex-none place-items-center rounded-[14px] text-xl" style={{ background: m.tipo === 'earn' ? 'var(--primary)' : 'var(--muted)', color: m.tipo === 'earn' ? 'var(--primary-foreground)' : 'var(--foreground)' }} aria-hidden="true">{m.tipo === 'earn' ? '+' : m.tipo === 'redeem' ? '−' : '×'}</span>
                <span className="flex flex-1 flex-col gap-0.5"><span className="text-base font-medium">{m.titulo}</span><span className="text-[13px] text-muted-foreground">{largoFecha(m.fecha)}</span></span>
                <span className="display tnum text-xl tracking-tight" style={{ color: m.tipo === 'earn' ? 'var(--success)' : m.tipo === 'expire' ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{arsFirmado(m.monto)}</span>
              </li>
            ))}
          </ul>
        </section>
        <p className="text-center text-[13px] text-muted-foreground">Mostrá el código al pagar. No hace falta instalar nada.</p>
      </main>
    </div>
  )
}
