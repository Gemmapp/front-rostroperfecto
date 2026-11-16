import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { aplicarTema, obtenerTema } from '@/componentes/proveedores'
import { Boton } from '@/componentes/interfaz/boton'
import { TemaInterruptor } from '@/componentes/interruptor-tema'
import { Avatar } from '@/componentes/interfaz/visualizacion'
import { rolEtiqueta } from '@/libreria/genero'
import { isDuenio, useSesion } from '@/libreria/sesion'
import { useSuscripcion } from '@/libreria/suscripcion'


/** Avatar de la cabecera con menu: usuario, tema claro/oscuro y cerrar sesion (celular, todas las pantallas del panel). */
export function UsuarioMenu() {
  const { sesion, firmarSalida } = useSesion()
  const navegar = useNavigate()
  const suscripcion = useSuscripcion()
  const [abierto, fijarAbierto] = useState(false)
  const [tema, fijarTema] = useState<'light' | 'dark'>('light')
  const caja = useRef<HTMLDivElement>(null)
  useEffect(() => fijarTema(obtenerTema()), [abierto])
  useEffect(() => {
    if (!abierto) return
    const onAbajo = (e: MouseEvent | TouchEvent) => { if (caja.current && !caja.current.contains(e.target as Node)) fijarAbierto(false) }
    const onClave = (e: KeyboardEvent) => { if (e.key === 'Escape') fijarAbierto(false) }
    document.addEventListener('mousedown', onAbajo); document.addEventListener('touchstart', onAbajo); document.addEventListener('keydown', onClave)
    return () => { document.removeEventListener('mousedown', onAbajo); document.removeEventListener('touchstart', onAbajo); document.removeEventListener('keydown', onClave) }
  }, [abierto])
  if (!sesion) return null
  return (
    <div ref={caja} className="relative">
      <button type="button" aria-haspopup="dialog" aria-expanded={abierto} aria-label={`Cuenta de ${sesion.usuarioNombre}`} onClick={() => fijarAbierto(!abierto)}
        className="grid size-11 place-items-center rounded-full">
        <Avatar nombre={sesion.usuarioNombre} foto={sesion.usuarioFoto} tamanio={40} tono={sesion.marca.tono} />
      </button>
      {abierto && (
        <div role="dialog" aria-label="Cuenta" className="absolute right-0 top-[calc(100%+6px)] z-40 flex w-[280px] flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card">
          <div className="flex flex-col"><span className="text-base font-semibold">{sesion.usuarioNombre}</span><span className="text-[13px] text-muted-foreground">{rolEtiqueta(sesion.rol, sesion.usuarioGenero)} · {sesion.marca.nombre}</span></div>
          <nav className="flex flex-col" aria-label="Cuenta">
            {sesion.locales && <Link to="/panel/locales" onClick={() => fijarAbierto(false)} className="flex h-11 items-center rounded-[12px] px-2 text-[15px] font-medium text-foreground no-underline hover:bg-muted">Cambiar de local</Link>}
            <Link to="/panel/perfil" onClick={() => fijarAbierto(false)} className="flex h-11 items-center rounded-[12px] px-2 text-[15px] font-medium text-foreground no-underline hover:bg-muted">Mi perfil</Link>
            {suscripcion && <Link to="/panel/suscripcion" onClick={() => fijarAbierto(false)} className="flex h-11 items-center rounded-[12px] px-2 text-[15px] font-medium text-foreground no-underline hover:bg-muted">Mi suscripción</Link>}
            {isDuenio(sesion) && <Link to="/panel/equipo" onClick={() => fijarAbierto(false)} className="flex h-11 items-center rounded-[12px] px-2 text-[15px] font-medium text-foreground no-underline hover:bg-muted">Mi equipo</Link>}
            {isDuenio(sesion) && <Link to="/panel/bienvenida" onClick={() => fijarAbierto(false)} className="flex h-11 items-center rounded-[12px] px-2 text-[15px] font-medium text-foreground no-underline hover:bg-muted">Guía de primeros pasos</Link>}
            <Link to="/panel/cambiar-clave" onClick={() => fijarAbierto(false)} className="flex h-11 items-center rounded-[12px] px-2 text-[15px] font-medium text-foreground no-underline hover:bg-muted">Cambiar mi clave</Link>
            {isDuenio(sesion) && <Link to="/panel/empresa" onClick={() => fijarAbierto(false)} className="flex h-11 items-center rounded-[12px] px-2 text-[15px] font-medium text-foreground no-underline hover:bg-muted">Configuración de empresa</Link>}
          </nav>
          <TemaInterruptor />
          <Boton variante="secondary" tamanio="md" className="w-full" onClick={() => { fijarAbierto(false); firmarSalida(); navegar('/panel/login', { replace: true }) }}>Cerrar sesión</Boton>
        </div>
      )}
    </div>
  )
}
