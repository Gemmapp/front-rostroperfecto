import { useState } from 'react'
import { AvatarSubidor } from '@/componentes/subidor-avatar'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Field } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import { cn } from '@/libreria/clases'
import { obtenerOrigen } from '@/libreria/datos'
import { GeneroOpciones, type Genero } from '@/libreria/genero'
import { errMensaje } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

export default function Perfil() {
  const { sesion, actualizar } = useSesion()
  const [nombre, fijarNombre] = useState(sesion!.usuarioCompletoNombre ?? sesion!.usuarioNombre)
  const [foto, fijarFoto] = useState(sesion!.usuarioFoto)
  const [genero, fijarGenero] = useState<Genero>(sesion!.usuarioGenero ?? null)
  const [ocupado, fijarOcupado] = useState(false)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)

  async function guardar() {
    if (!nombre.trim()) { fijarMensaje({ ok: false, texto: 'Poné tu nombre.' }); return }
    fijarOcupado(true)
    try {
      const guardado = await obtenerOrigen().guardarPerfil(sesion!, { nombre: nombre.trim(), foto })
      let g = sesion!.usuarioGenero ?? null
      if (genero && genero !== g) g = (await api.personal.actualizarMe({ genero: genero })).genero ?? genero
      actualizar({ usuarioNombre: guardado.nombre.split(' ')[0], usuarioCompletoNombre: guardado.nombre, usuarioFoto: guardado.foto, usuarioGenero: g })
      fijarMensaje({ ok: true, texto: 'Perfil guardado.' })
    } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) } finally { fijarOcupado(false) }
  }
  return (
    <div className="mx-auto flex w-full flex-col gap-[18px] px-[18px] pb-10 pt-4 lg:max-w-[560px] lg:px-0 lg:pt-2">
      <h1 className="display text-[42px] leading-none tracking-[-.04em]">Mi perfil</h1>
      <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-[18px]">
        <AvatarSubidor etiqueta="Subir foto" nombre={nombre || sesion!.usuarioNombre} valor={foto} onCambiar={(p) => { fijarFoto(p); fijarMensaje(null) }} tono={sesion!.marca.tono} />
        <Field etiqueta="Nombre" value={nombre} onChange={(e) => { fijarNombre(e.target.value); fijarMensaje(null) }} autoComplete="name" />
        <div className="flex flex-col gap-2" role="group" aria-label="Cómo querés que te tratemos">
          <span className="text-sm text-muted-foreground">¿Cómo querés que te tratemos en los textos?</span>
          <div className="flex flex-col gap-2">
            {GeneroOpciones.map((o) => (
              <button key={o.valor} type="button" aria-pressed={genero === o.valor} onClick={() => { fijarGenero(o.valor); fijarMensaje(null) }}
                className={cn('min-h-11 rounded-card border px-3 py-2 text-left', genero === o.valor ? 'border-primary-text bg-accent-soft' : 'border-border bg-card')}>
                <span className="block text-[15px] font-semibold">{o.etiqueta}</span><span className="block text-[13px] text-muted-foreground">{o.pista}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      {mensaje && <Aviso ok={mensaje.ok}>{mensaje.texto}</Aviso>}
      <Boton disabled={ocupado} onClick={guardar} className="lg:w-auto lg:self-start lg:px-10">{ocupado ? 'Guardando…' : 'Guardar'}</Boton>
    </div>
  )
}
