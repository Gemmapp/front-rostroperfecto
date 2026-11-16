import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AvatarSubidor } from '@/componentes/subidor-avatar'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { SeccionTitulo } from '@/componentes/interfaz/visualizacion'
import { Field } from '@/componentes/interfaz/campo'
import { tonoDesdeColor } from '@/libreria/marca'
import { cn } from '@/libreria/clases'
import { obtenerOrigen } from '@/libreria/datos'
import type { Empresa } from '@/libreria/datos/tipos'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { useGuia } from '@/libreria/guia'
import { isDuenio, useSesion } from '@/libreria/sesion'

const Preajustes = [
  { nombre: 'Rosa', valor: 'oklch(0.82 0.08 350)' }, { nombre: 'Malva', valor: 'oklch(0.78 0.07 305)' }, { nombre: 'Azul', valor: 'oklch(0.8 0.08 250)' },
  { nombre: 'Verde', valor: 'oklch(0.82 0.08 160)' }, { nombre: 'Arena', valor: 'oklch(0.84 0.07 75)' },
]

/** Solo dueños: el empleado vuelve a Inicio con un aviso (el servidor igual responde 403). */
export default function Empresa() {
  const { sesion } = useSesion()
  if (!isDuenio(sesion)) return <Navigate to="/panel" replace state={{ aviso: 'La configuración de empresa es solo para dueños del local.' }} />
  return <EmpresaInterno />
}

function EmpresaInterno() {
  const { sesion, actualizar } = useSesion()
  const origen = obtenerOrigen()
  const { terminar } = useGuia()
  const cargado = useCargar(() => origen.obtenerEmpresa(sesion!), [])
  const [c, fijarC] = useState<Empresa | null>(null)
  const [ocupado, fijarOcupado] = useState(false)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  useEffect(() => { if (cargado.datos) fijarC(cargado.datos) }, [cargado.datos])
  const [errores, fijarErrores] = useState<{ telefono?: string; instagram?: string }>({})
  const fijarContacto = (p: Partial<NonNullable<Empresa['contactos']>>) => { fijarMensaje(null); fijarC((x) => (x ? { ...x, contactos: { ...x.contactos, ...p } } : x)) }
  const fijar = (p: Partial<Empresa>) => { fijarMensaje(null); fijarC((x) => (x ? { ...x, ...p } : x)) }
  const tono = tonoDesdeColor(c?.acentoColor, sesion!.marca.tono)
  const hex = c?.acentoColor && /^#[0-9a-f]{6}$/i.test(c.acentoColor) ? c.acentoColor : '#c9879b'

  async function guardar() {
    if (!c) return
    if (!c.nombre.trim()) { fijarMensaje({ ok: false, texto: 'Poné el nombre del local.' }); return }
    const telefono = c.contactos?.telefono?.trim() ?? '', ig = c.contactos?.instagram?.trim() ?? ''
    const nuevos: typeof errores = {}
    if (telefono && !/^[0-9()\-\s+]{6,40}$/.test(telefono)) nuevos.telefono = 'Usá entre 6 y 40 caracteres: números, espacios y ( ) -'
    if (ig && !/^@?[A-Za-z0-9._]+$/.test(ig)) nuevos.instagram = 'Solo letras, números, punto y guion bajo.'
    fijarErrores(nuevos)
    if (Object.keys(nuevos).length) return
    fijarOcupado(true)
    try {
      const guardado = await origen.guardarEmpresa(sesion!, { ...c, nombre: c.nombre.trim() })
      actualizar({ marca: { nombre: guardado.nombre, logoUrl: guardado.logoUrl, tono: tonoDesdeColor(guardado.acentoColor, tono) }, localNombre: guardado.nombre })
      if (!terminar()) { fijarMensaje({ ok: true, texto: 'Datos de la empresa guardados.' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) } finally { fijarOcupado(false) }
  }

  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-10 pt-4 lg:px-0 lg:pt-2">
      <h1 className="display text-[42px] leading-none tracking-[-.04em]">Mi empresa</h1>
      {mensaje && <Aviso ok={mensaje.ok}>{mensaje.texto}</Aviso>}
      {cargado.error && <Aviso>{cargado.error}</Aviso>}
      {c && (
        <div className="flex flex-col gap-6 lg:max-w-[640px]">
          <div className="flex flex-col gap-[18px]">
            <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-[18px]">
              <SeccionTitulo>Logo y nombre</SeccionTitulo>
              <AvatarSubidor etiqueta="Subir logo" nombre={c.nombre || 'L'} valor={c.logoUrl} onCambiar={(logoUrl) => fijar({ logoUrl })} tono={tono} />
              <Field etiqueta="Nombre del local" value={c.nombre} onChange={(e) => fijar({ nombre: e.target.value })} autoComplete="organization" />
            </section>
            <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-[18px]">
              <SeccionTitulo>Color de marca</SeccionTitulo>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Colores sugeridos">
                {Preajustes.map((p) => (
                  <button key={p.valor} type="button" aria-label={p.nombre} aria-pressed={c.acentoColor === p.valor} onClick={() => fijar({ acentoColor: p.valor })}
                    className={cn('grid size-11 place-items-center rounded-full border-2', c.acentoColor === p.valor ? 'border-foreground' : 'border-border')}>
                    <span className="size-7 rounded-full" style={{ background: p.valor }} />
                  </button>
                ))}
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium">
                  Otro
                  <input type="color" value={hex} onChange={(e) => fijar({ acentoColor: e.target.value })} aria-label="Elegir otro color" className="size-7 cursor-pointer rounded border-0 bg-transparent p-0" />
                </label>
              </div>
              <p className="text-[13px] text-muted-foreground">El color se aplica a botones, acentos y la tarjeta de tus clientes. Los textos se ajustan solos para que se lean bien.</p>
            </section>
            <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px]">
              <SeccionTitulo>Contacto</SeccionTitulo>
              <Field etiqueta="WhatsApp o teléfono" inputMode="tel" autoComplete="tel" value={c.contactos?.telefono ?? ''} onChange={(e) => fijarContacto({ telefono: e.target.value })} error={errores.telefono} pista="Solo números, espacios y ( ) -" />
              <Field etiqueta="Instagram" autoCapitalize="none" value={c.contactos?.instagram ?? ''} onChange={(e) => fijarContacto({ instagram: e.target.value })} error={errores.instagram} pista="Tu usuario, con o sin @" />
              <Field etiqueta="Dirección" autoComplete="street-address" value={c.contactos?.direccion ?? ''} onChange={(e) => fijarContacto({ direccion: e.target.value })} />
            </section>
            <Boton disabled={ocupado} onClick={guardar} className="lg:w-auto lg:self-start lg:px-10">{ocupado ? 'Guardando…' : 'Guardar'}</Boton>
          </div>
        </div>
      )}
    </div>
  )
}
