import { useEffect, useState } from 'react'
import { aplicarTema, obtenerTema } from '@/componentes/proveedores'
import { Boton } from '@/componentes/interfaz/boton'
import { Segmentado, Contador, Interruptor } from '@/componentes/interfaz/controles'
import { Avatar, NivelEtiqueta, ListarFila, FidelidadTarjeta, Pastilla, SeccionTitulo, ServicioTarjeta, SelloFila, DatoTarjeta } from '@/componentes/interfaz/visualizacion'
import { Field } from '@/componentes/interfaz/campo'
import { FlotanteNav } from '@/componentes/interfaz/navegacion-flotante'
import { InferiorHoja } from '@/componentes/interfaz/hoja'
import { Aviso } from '@/componentes/interfaz/aviso'

const Marcas = [{ id: 'rosa', nombre: 'Rosa' }, { id: 'malva', nombre: 'Malva' }, { id: 'arena', nombre: 'Arena' }]

// Vista de ejemplo de tokens y componentes base (datos de muestra, solo diseno). Ruta: /guia-visual
export default function GuiaVisual() {
  const [marca, fijarMarca] = useState('rosa')
  const [tema, fijarTema] = useState<'light' | 'dark'>('light')
  const [sw, fijarSw] = useState(true)
  const [seg, fijarSeg] = useState<'a' | 'b'>('a')
  const [paso, fijarPaso] = useState(5)
  const [hoja, fijarHoja] = useState(false)
  useEffect(() => fijarTema(obtenerTema()), [])

  return (
    <div data-brand={marca === 'rosa' ? undefined : marca} className="min-h-dvh bg-background pb-32">
      <main className="mx-auto flex w-full max-w-[420px] flex-col gap-5 px-[18px] pt-6">
        <header className="flex items-center justify-between"><span className="display text-[22px]">Guía visual</span><Pastilla tono="atenuado">Guía visual</Pastilla></header>
        <Segmentado etiqueta="Tema" valor={tema} onCambiar={(t) => { fijarTema(t); aplicarTema(t) }} opciones={[{ valor: 'light', etiqueta: 'Claro' }, { valor: 'dark', etiqueta: 'Oscuro' }]} />
        <div className="flex items-center gap-3" role="group" aria-label="Marca">
          <span className="text-sm text-muted-foreground">Marca</span>
          {Marcas.map((b) => <button key={b.id} type="button" aria-label={b.nombre} aria-pressed={marca === b.id} onClick={() => fijarMarca(b.id)} className="size-8 rounded-full border-[3px] border-background" style={{ background: { rosa: 'oklch(0.82 0.08 350)', malva: 'oklch(0.78 0.07 305)', arena: 'oklch(0.84 0.07 75)' }[b.id], boxShadow: `0 0 0 2px ${marca === b.id ? 'var(--foreground)' : 'var(--border)'}` }} />)}
        </div>

        <h1 className="display text-[42px] leading-none tracking-[-.04em]">Claro como un banco. Cuidado como un salón.</h1>

        <SeccionTitulo>Botones</SeccionTitulo>
        <Boton>Registrar · cobrar $8.450</Boton>
        <div className="flex gap-2"><Boton variante="secondary" tamanio="md" className="flex-1">Secundario</Boton><Boton variante="texto" tamanio="md">Texto</Boton></div>

        <SeccionTitulo>Campos</SeccionTitulo>
        <Field etiqueta="Email" defaultValue="carolina@estudioaura.com" />
        <Field etiqueta="Contraseña" type="password" defaultValue="x" error="Revisá la contraseña y probá de nuevo." />

        <SeccionTitulo>Niveles y chips</SeccionTitulo>
        <div className="flex flex-wrap items-center gap-2"><NivelEtiqueta nivel="base" /><NivelEtiqueta nivel="plata" /><NivelEtiqueta nivel="oro" /><Pastilla>+8% vs. octubre</Pastilla><Pastilla tono="soft">Suma $700</Pastilla></div>

        <SeccionTitulo>Controles</SeccionTitulo>
        <div className="flex items-center justify-between"><span className="font-semibold">Usar lo acumulado</span><Interruptor etiqueta="Usar lo acumulado" marcado={sw} onCambiar={fijarSw} /></div>
        <Segmentado etiqueta="Vista" valor={seg} onCambiar={fijarSeg} opciones={[{ valor: 'a', etiqueta: 'Tarjetas' }, { valor: 'b', etiqueta: 'Lista' }]} />
        <Contador etiqueta="Devolución base" valor={paso} min={1} max={20} onCambiar={fijarPaso} formato={(v) => `${v}%`} />

        <SeccionTitulo>Tarjeta del cliente</SeccionTitulo>
        <FidelidadTarjeta>
          <div className="flex items-center justify-between"><span className="text-[13px] text-[#FAF2F3]/70">Tarjeta de cliente</span><NivelEtiqueta nivel="plata" /></div>
          <p className="display tnum mt-6 text-[78px] leading-[.88] tracking-[-.04em]">$8.450</p>
        </FidelidadTarjeta>
        <SelloFila total={5} hecho={3} />

        <SeccionTitulo>Estadísticas y filas</SeccionTitulo>
        <div className="grid grid-cols-2 gap-3"><DatoTarjeta etiqueta="Puntos emitidos" valor="$412.600" pista="en total" /><DatoTarjeta etiqueta="Canjes" valor="126" pista="$168.400 en descuentos" /></div>
        <ListarFila inicio={<Avatar nombre="Lucía Benítez" tamanio={40} />} titulo="Lucía Benítez" subtitulo="Esculpidas en gel · hace 4 min" final={<span className="display text-[17px] text-success">+$1.100</span>} />
        <div className="grid grid-cols-2 gap-3"><ServicioTarjeta nombre="Manicura semipermanente" precio="$14.000" sumar="Suma $700" /><ServicioTarjeta nombre="Pedicuría spa" precio="$16.000" sumar="Suma $600" pausado /></div>
        <Aviso ok>Reglas guardadas.</Aviso>
        <Boton variante="secondary" tamanio="md" onClick={() => fijarHoja(!hoja)}>{hoja ? 'Cerrar hoja' : 'Ver hoja inferior'}</Boton>
      </main>
      {hoja && <InferiorHoja><p className="font-semibold">2 servicios · $36.000</p><Boton onClick={() => fijarHoja(false)}>Registrar · cobrar $36.000</Boton></InferiorHoja>}
      {!hoja && <FlotanteNav />}
    </div>
  )
}
