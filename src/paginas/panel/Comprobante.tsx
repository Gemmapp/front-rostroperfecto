import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Boton } from '@/componentes/interfaz/boton'
import { obtenerComprobante } from '@/libreria/flujo'
import { ars } from '@/libreria/formato'
import { puntosYPesos } from '@/libreria/datos/sumar'
import { useCantidadUp } from '@/libreria/ganchos'
import type { Comprobante } from '@/libreria/datos/tipos'

const Chispas = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + 0.2, r = 92 + (i % 3) * 22
  return { tamanio: i % 3 ? 7 : 10, dx: Math.cos(a) * r, dy: Math.sin(a) * r, own: i % 2 === 0 }
})

export default function Comprobante() {
  const navegar = useNavigate()
  const [comprobante, fijarComprobante] = useState<Comprobante | null>(null)
  const [fx, fijarFx] = useState(false)
  useEffect(() => {
    const r = obtenerComprobante()
    if (!r) { navegar('/panel', { replace: true }); return }
    fijarComprobante(r)
    const t = setTimeout(() => fijarFx(true), 30)
    return () => clearTimeout(t)
  }, [navegar])
  const ganado = useCantidadUp(comprobante?.ganado ?? 0, 1000, 300)
  const saldo = useCantidadUp(comprobante?.nuevoSaldo ?? 0, 1100, 500)
  if (!comprobante) return null

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-56px)] w-full flex-col items-center gap-3 px-[18px] pb-6 pt-[34px] lg:min-h-[calc(100dvh-48px)] lg:max-w-[520px] lg:justify-center lg:pt-6">
      <div className="relative mt-3 size-[120px] flex-none" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-primary motion-safe:animate-[ring_1.1s_.2s_ease-out_both]" />
        <span className="absolute inset-0 grid place-items-center rounded-full bg-primary shadow-[0_12px_40px_-8px_var(--primary)] motion-safe:animate-[pop_.55s_cubic-bezier(.3,1.4,.5,1)_both]">
          <svg width="54" height="54" viewBox="0 0 54 54"><path d="M13 28 L23 38 L42 16" fill="none" stroke="var(--primary-foreground)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" className="motion-safe:animate-[draw_.45s_.35s_both_ease-out]" /></svg>
        </span>
        {Chispas.map((d, i) => (
          <span key={i} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: d.tamanio, height: d.tamanio, margin: -4, background: d.own ? 'var(--primary)' : 'var(--foreground)', transform: fx ? `translate(${d.dx}px, ${d.dy}px) scale(.4)` : 'translate(0,0) scale(1)', opacity: fx ? 0 : 1, transition: 'transform .9s .3s cubic-bezier(.1,.8,.3,1), opacity .9s .3s ease-out' }} />
        ))}
      </div>
      <p className="mt-3.5 text-[15px] text-muted-foreground">Sumaste a {comprobante.clienteNombre}</p>
      <p className="display tnum text-[92px] leading-[.85] tracking-[-.05em] text-primary-text" aria-label={`Suma ${ars(comprobante.ganado)}`}>+{ars(ganado)}</p>
      <section className="rise mt-3.5 w-full rounded-[26px] border border-border bg-card px-[18px] py-1.5 shadow-card" style={{ ['--i' as string]: 8 }} aria-label="Detalle">
        {comprobante.lineas.map((l) => <Fila key={l.etiqueta} k={l.etiqueta} v={l.libre ? 'Gratis' : ars(l.monto)} color={l.libre ? 'var(--primary-text)' : undefined} />)}
        {comprobante.descuento > 0 && <><Fila k="Descuento aplicado" v={ars(-comprobante.descuento)} /><Fila k="A cobrar" v={ars(comprobante.toPagar)} /></>}
        <Fila k="Puntos que suma" v={comprobante.puntosModo && comprobante.ganadoPuntos !== undefined ? `+${puntosYPesos(comprobante.ganadoPuntos, comprobante.ganado)}` : `+${ars(comprobante.ganado)}`} color="var(--success)" />
        {comprobante.premioDesbloqueado && <Fila k="Premio por visitas" v={`${comprobante.premioDesbloqueado} gratis`} color="var(--primary-text)" />}
        <div className="flex items-baseline justify-between pb-3 pt-3.5"><span className="text-base font-semibold">Le queda para usar</span><span className="display tnum text-[34px] tracking-[-.03em]">{ars(saldo)}</span></div>
      </section>
      <div className="min-h-2 flex-1" />
      <Boton onClick={() => navegar('/panel', { replace: true })}>Listo</Boton>
      <Boton variante="texto" tamanio="md" onClick={() => navegar('/panel/escanear', { replace: true })}>Escanear otra cliente</Boton>
    </div>
  )
}

function Fila({ k, v, color }: { k: string; v: string; color?: string }) {
  return <div className="flex items-center justify-between border-b border-border py-3.5 text-base"><span className="text-muted-foreground">{k}</span><span className="tnum font-semibold" style={{ color }}>{v}</span></div>
}
