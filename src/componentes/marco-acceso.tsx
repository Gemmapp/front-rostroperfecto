import type { ReactNode } from 'react'
import { NivelEtiqueta } from '@/componentes/interfaz/visualizacion'
import { marcaEstilo } from '@/libreria/marca'
import { CLIENTE } from '@/libreria/cliente'
import { recurso } from '@/libreria/enlaces'

/** Marco de las pantallas de acceso (ingresar, recuperar y elegir clave): presentacion a la izquierda y el formulario a la derecha. */
export function AccesoMarco({ children }: { children: ReactNode }) {
  return (
    <div style={marcaEstilo(350)} className="brand-scope min-h-dvh bg-background">
      <main className="mx-auto flex w-full max-w-[460px] flex-col lg:grid lg:min-h-dvh lg:max-w-none lg:grid-cols-[1.1fr_1fr]">
        {/* Presentacion */}
        <section className="relative flex flex-col gap-7 overflow-hidden px-[22px] pb-9 pt-12 lg:justify-center lg:gap-10 lg:px-20 lg:py-16"
          style={{ background: 'radial-gradient(120% 90% at 0% 0%, color-mix(in oklch, var(--primary) 38%, var(--background)) 0%, var(--accent-soft) 55%, var(--background) 100%)' }}>
          <div className="flex items-center gap-3">
            <img src={recurso(CLIENTE.logo)} alt="" width={52} height={52} className="size-[52px] rounded-full object-cover" />
            <span className="display text-[24px] leading-none tracking-[-.02em]">{CLIENTE.nombre}</span>
          </div>
          <div className="flex flex-col gap-3 lg:max-w-[520px]">
            <h1 className="display text-[40px] leading-[.98] tracking-[-.04em] lg:text-[60px]">Que tus clientes vuelvan.</h1>
            <p className="m-0 text-[17px] leading-snug text-foreground/75 lg:text-[19px]">Puntos, turnos online y un panel simple para tu local.</p>
          </div>
          <div className="relative h-[196px] lg:h-[280px] lg:max-w-[520px]" aria-hidden="true">
            <div className="absolute left-[6%] top-5 h-[170px] w-[82%] rotate-[6deg] rounded-[28px] bg-primary/80 lg:h-[240px]" />
            <div className="absolute left-0 top-0 flex h-[176px] w-[86%] flex-col justify-between rounded-[28px] bg-[#2A1D21] p-5 text-[#FAF2F3] shadow-[0_28px_44px_-24px_rgba(30,12,18,.7)] motion-safe:animate-[float_6s_ease-in-out_infinite] lg:h-[250px] lg:p-7" style={{ transform: 'rotate(-3deg)' }}>
              <div className="flex items-center justify-between"><span className="text-[13px] text-[#FAF2F3]/70">Tarjeta de cliente</span><NivelEtiqueta nivel="oro" /></div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#FAF2F3]/65">Tus puntos</span>
                <span className="display tnum text-[52px] leading-[.9] tracking-[-.04em] lg:text-[76px]">845</span>
                <span className="mt-1 self-start rounded-full bg-white/10 px-3 py-1 text-[12px]">equivalen a $8.450</span>
              </div>
            </div>
            <div className="absolute -bottom-1 right-0 flex items-center gap-3 rounded-[18px] bg-card px-4 py-3 shadow-[0_18px_30px_-18px_rgba(30,12,18,.5)] lg:-bottom-3">
              <span className="grid size-9 place-items-center rounded-full bg-success/15 text-success" aria-hidden="true">✓</span>
              <span className="flex flex-col leading-tight"><span className="text-[13px] font-semibold">Turno confirmado</span><span className="text-xs text-muted-foreground">Hoy · 16:30</span></span>
            </div>
          </div>
          <ul className="m-0 hidden list-none flex-col gap-3 p-0 lg:flex lg:max-w-[520px]">
            {['Puntos y premios que se acumulan solos', 'Turnos online desde tu Instagram y WhatsApp', 'Todo desde el celular, sin instalar nada'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[16px] font-medium"><span className="grid size-6 flex-none place-items-center rounded-full bg-primary text-[13px] text-primary-foreground" aria-hidden="true">✓</span>{t}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-1 flex-col justify-center gap-6 px-[22px] pb-10 pt-8 lg:mx-auto lg:w-full lg:max-w-[460px] lg:px-10 lg:py-16">
          {children}
        </section>
      </main>
    </div>
  )
}
