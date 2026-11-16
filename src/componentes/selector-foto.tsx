import { useRef, useState } from 'react'
import { obtenerOrigen } from '@/libreria/datos'
import { errMensaje } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'
import { Aviso } from '@/componentes/interfaz/aviso'
import { recursoUrl } from '@/libreria/api/http'
import { Boton } from '@/componentes/interfaz/boton'
import { cn } from '@/libreria/clases'

const MAX = 2_000_000 // la API acepta hasta 2 MB (PNG, JPEG o WEBP)

/** Foto opcional: tocar para elegir; "Quitar foto" la saca. */
export function FotoSelector({ valor, onCambiar, redondear, etiqueta }: { valor?: string; onCambiar: (v: string | undefined) => void; redondear?: boolean; etiqueta: string }) {
  const entrada = useRef<HTMLInputElement>(null)
  const { sesion } = useSesion()
  const [error, fijarError] = useState<string | null>(null)
  const [ocupado, fijarOcupado] = useState(false)
  async function elegir(archivo?: File) {
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) { fijarError('Elegí una imagen.'); return }
    if (archivo.size > MAX) { fijarError('La foto pesa demasiado. Probá con una más chica.'); return }
    fijarError(null); fijarOcupado(true)
    try { onCambiar(await obtenerOrigen().subirImagen(sesion!, archivo)) } catch (e) { fijarError(errMensaje(e)) } finally { fijarOcupado(false) }
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" aria-label={etiqueta} onClick={() => entrada.current?.click()}
        className={cn('stripes relative grid place-items-center overflow-hidden border border-border text-[13px] font-medium text-muted-foreground', redondear ? 'size-[104px] rounded-full' : 'h-[150px] w-full rounded-card')}>
        {valor ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={recursoUrl(valor)} alt="" className="absolute inset-0 size-full object-cover" /> : <span>{ocupado ? 'Subiendo…' : 'Tocá para elegir'}</span>}
      </button>
      <input ref={entrada} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => elegir(e.target.files?.[0])} />
      {valor && <Boton variante="texto" tamanio="sm" className="!px-1" onClick={() => onCambiar(undefined)}>Quitar foto</Boton>}
      {error && <Aviso className="text-[13px]">{error}</Aviso>}
    </div>
  )
}
