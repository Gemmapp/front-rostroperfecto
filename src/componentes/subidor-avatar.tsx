import { useRef, useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Avatar } from '@/componentes/interfaz/visualizacion'
import { ImagenRecortador } from '@/componentes/recortador-imagen'
import { obtenerOrigen } from '@/libreria/datos'
import { errMensaje } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

const MAX = 2_000_000 // la API acepta hasta 2 MB (PNG, JPEG o WEBP)
const Tipos = ['image/png', 'image/jpeg', 'image/webp']

/** Foto cuadrada con vista previa: elegir -> validar -> recortar -> subir. `value` es la URL relativa que devuelve la API. */
export function AvatarSubidor({ valor, onCambiar, nombre, etiqueta, tamanio = 96, tono }: { valor?: string; onCambiar: (url: string | undefined) => void; nombre: string; etiqueta: string; tamanio?: number; tono?: number }) {
  const { sesion } = useSesion()
  const entrada = useRef<HTMLInputElement>(null)
  const [elegido, fijarElegido] = useState<File | null>(null)
  const [ocupado, fijarOcupado] = useState(false)
  const [error, fijarError] = useState<string | null>(null)

  function elegir(archivo?: File) {
    if (entrada.current) entrada.current.value = ''
    if (!archivo) return
    if (!Tipos.includes(archivo.type)) { fijarError('Usá una imagen PNG, JPEG o WEBP.'); return }
    if (archivo.size > MAX * 4) { fijarError('La imagen es demasiado grande. Probá con una de menos de 8 MB.'); return }
    fijarError(null); fijarElegido(archivo)
  }
  async function subir(recortado: File) {
    fijarElegido(null)
    if (recortado.size > MAX) { fijarError('La foto pesa más de 2 MB incluso recortada. Probá con otra.'); return }
    fijarOcupado(true)
    try { onCambiar(await obtenerOrigen().subirImagen(sesion!, recortado)) } catch (e) { fijarError(errMensaje(e)) } finally { fijarOcupado(false) }
  }
  return (
    <div className="flex items-center gap-4">
      <Avatar nombre={nombre} foto={valor} tamanio={tamanio} tono={tono} />
      <div className="flex flex-col items-start gap-1">
        <Boton variante="secondary" tamanio="md" className="!w-auto" disabled={ocupado} onClick={() => entrada.current?.click()}>{ocupado ? 'Subiendo…' : valor ? 'Cambiar foto' : etiqueta}</Boton>
        {valor && <Boton variante="texto" tamanio="sm" className="!px-1" onClick={() => onCambiar(undefined)}>Quitar foto</Boton>}
        {error && <Aviso className="text-[13px]">{error}</Aviso>}
      </div>
      <input ref={entrada} type="file" accept={Tipos.join(',')} hidden onChange={(e) => elegir(e.target.files?.[0])} />
      {elegido && <ImagenRecortador archivo={elegido} redondear onCancelar={() => fijarElegido(null)} onHecho={subir} />}
    </div>
  )
}
