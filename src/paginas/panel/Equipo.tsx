import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { Avatar, SeccionTitulo } from '@/componentes/interfaz/visualizacion'
import { Field } from '@/componentes/interfaz/campo'
import { api } from '@/libreria/api/peticiones'
import type { PersonalMiembro } from '@/libreria/api/tipos'
import { cn } from '@/libreria/clases'
import { recursoUrl } from '@/libreria/api/http'
import { rolEtiqueta } from '@/libreria/genero'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { useGuia } from '@/libreria/guia'
import { isDuenio, useSesion } from '@/libreria/sesion'


/** Solo dueños. El servidor igual valida el rol (403) y el límite de usuarios del plan (402). */
export default function Equipo() {
  const { sesion } = useSesion()
  if (!isDuenio(sesion)) return <Navigate to="/panel" replace state={{ aviso: 'El equipo lo manejan los dueños del local.' }} />
  return <EquipoInterno />
}

function EquipoInterno() {
  const { sesion } = useSesion()
  const localId = sesion!.localId
  const principal = sesion!.rol === 'DUENIO'
  const listar = useCargar(() => api.personal.listarPersonal(localId), [localId])
  const { terminar } = useGuia()
  const [abierto, fijarAbierto] = useState(false)
  const [f, fijarF] = useState({ name: '', correo: '', contrasenia: '', rol: 'INTEGRANTE' as 'INTEGRANTE' })
  const [ocupado, fijarOcupado] = useState(false)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const [confirmar, fijarConfirmar] = useState<string | null>(null)

  async function agregar(e: React.FormEvent) {
    e.preventDefault()
    fijarMensaje(null)
    if (f.name.trim().length < 2) return fijarMensaje({ ok: false, texto: 'Poné el nombre de la persona.' })
    if (!f.correo.trim()) return fijarMensaje({ ok: false, texto: 'Poné el email o usuario con el que va a entrar.' })
    if (f.contrasenia.length < 8) return fijarMensaje({ ok: false, texto: 'La clave provisoria debe tener al menos 8 caracteres.' })
    fijarOcupado(true)
    try {
      const m = await api.personal.agregarPersonal(localId, { correo: f.correo.trim(), nombre: f.name.trim(), contrasenia: f.contrasenia, rol: f.rol })
      fijarMensaje({ ok: true, texto: `Listo: ${m.nombre} ya puede entrar con ${m.correo}. Al primer ingreso tendrá que elegir su propia clave.` })
      fijarF({ name: '', correo: '', contrasenia: '', rol: 'INTEGRANTE' })
      fijarAbierto(false)
      listar.recargar()
      terminar()
    } catch (err) { fijarMensaje({ ok: false, texto: errMensaje(err) }) } finally { fijarOcupado(false) }
  }

  async function quitar(m: PersonalMiembro) {
    fijarOcupado(true); fijarMensaje(null)
    try { await api.personal.quitarPersonal(localId, m.usuarioId); fijarConfirmar(null); fijarMensaje({ ok: true, texto: `${m.nombre} ya no tiene acceso al local.` }); listar.recargar() }
    catch (err) { fijarMensaje({ ok: false, texto: errMensaje(err) }) } finally { fijarOcupado(false) }
  }

  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-10 pt-4 lg:px-0 lg:pt-2">
      <header className="flex items-center justify-between gap-3">
        <h1 className="display text-[42px] leading-none tracking-[-.04em]">Mi equipo</h1>
        {!abierto && <Boton tamanio="md" onClick={() => { fijarAbierto(true); fijarMensaje(null) }}>Agregar</Boton>}
      </header>
      {mensaje && <Aviso ok={mensaje.ok}>{mensaje.texto}</Aviso>}
      {abierto && (
        <form onSubmit={agregar} className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px] lg:max-w-[560px]" aria-label="Agregar persona">
          <SeccionTitulo>Nueva persona</SeccionTitulo>
          <Field etiqueta="Nombre" autoComplete="off" value={f.name} onChange={(e) => fijarF({ ...f, name: e.target.value })} />
          <Field etiqueta="Email o usuario de ingreso" autoComplete="off" autoCapitalize="none" value={f.correo} onChange={(e) => fijarF({ ...f, correo: e.target.value })} />
          <Field etiqueta="Clave provisoria" type="text" autoComplete="off" pista="Se la pasás vos. Al primer ingreso va a tener que cambiarla." value={f.contrasenia} onChange={(e) => fijarF({ ...f, contrasenia: e.target.value })} />
          <div className="flex gap-2"><Boton variante="secondary" onClick={() => fijarAbierto(false)}>Cancelar</Boton><Boton type="submit" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Agregar'}</Boton></div>
        </form>
      )}
      {listar.error && <Aviso>{listar.error}</Aviso>}
      <ul className="m-0 flex list-none flex-col gap-2 p-0 lg:max-w-[760px]">
        {listar.datos?.map((m) => (
          <li key={m.usuarioId} className="flex items-center gap-3 rounded-card border border-border bg-card p-3">
            <Avatar nombre={m.nombre} foto={recursoUrl(m.fotoUrl)} tamanio={44} tono={sesion!.marca.tono} />
            <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[16px] font-semibold">{m.nombre}</span><span className="truncate text-[13px] text-muted-foreground">{m.correo} · {rolEtiqueta(m.rol, m.genero)}</span></span>
            {m.rol === 'INTEGRANTE' && (confirmar === m.usuarioId
              ? <span className="flex gap-2"><Boton tamanio="md" variante="secondary" onClick={() => fijarConfirmar(null)}>No</Boton><Boton tamanio="md" variante="danger" disabled={ocupado} onClick={() => quitar(m)}>Quitar</Boton></span>
              : <Boton tamanio="md" variante="secondary" onClick={() => fijarConfirmar(m.usuarioId)} aria-label={`Quitar a ${m.nombre}`}>Quitar</Boton>)}
          </li>
        ))}
        {listar.datos?.length === 0 && <li className="text-[15px] text-muted-foreground">Todavía no hay nadie más en tu equipo.</li>}
      </ul>
      {principal && <p className="m-0 text-sm text-muted-foreground lg:max-w-[760px]">Quitar a alguien le saca el acceso a este local; no borra sus visitas ni los datos que cargó.</p>}
    </div>
  )
}
