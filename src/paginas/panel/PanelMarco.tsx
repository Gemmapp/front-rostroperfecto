import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { FlotanteNav } from '@/componentes/interfaz/navegacion-flotante'
import { BarraLateral } from '@/componentes/interfaz/barra-lateral'
import { GuiaPista } from '@/componentes/cartel-guia'
import { SuscripcionAviso } from '@/componentes/aviso-suscripcion'
import { Avatar } from '@/componentes/interfaz/visualizacion'
import { UsuarioMenu } from '@/componentes/menu-usuario'
import { marcaEstilo } from '@/libreria/marca'
import { obtenerOrigen } from '@/libreria/datos'
import { api } from '@/libreria/api/peticiones'
import { isDuenio, useSesion } from '@/libreria/sesion'

// Pantallas de flujo (sin barra de navegacion)
const Flujo = ['/panel/escanear', '/panel/registrar', '/panel/comprobante', '/panel/clientes/nuevo', '/panel/servicios/nuevo']
const isFlujo = (p: string) => Flujo.includes(p) || /^\/panel\/clientes\/[^/]+\/editar$/.test(p) || /^\/panel\/servicios\/[^/]+$/.test(p)

export default function PanelMarco() {
  const { sesion, listo, actualizar } = useSesion()
  const ruta = useLocation().pathname
  const navegar = useNavigate()
  useEffect(() => { if (listo && !sesion) navegar('/panel/login', { replace: true }) }, [listo, sesion, navegar])
  // Clave provisoria: hasta cambiarla no se puede usar nada mas (el servidor tambien lo exige).
  useEffect(() => {
    if (sesion?.debeCambiarContrasenia && ruta !== '/panel/cambiar-clave') navegar('/panel/cambiar-clave', { replace: true })
  }, [sesion?.debeCambiarContrasenia, ruta, navegar])
  // Primer ingreso del dueno principal: nombre de la empresa y como quiere que lo traten (una vez; "Mas tarde" la oculta en esta sesion).
  useEffect(() => {
    if (!sesion || sesion.debeCambiarContrasenia || sesion.rol !== 'DUENIO' || sesion.usuarioGenero || ruta === '/panel/configurar') return
    try { if (sessionStorage.getItem('fidelapp.setup.skip')) return } catch { /* sin storage */ }
    navegar('/panel/configurar', { replace: true })
  }, [sesion?.rol, sesion?.usuarioGenero, sesion?.debeCambiarContrasenia, ruta, navegar])
  // Primer ingreso de un dueno: guia de primeros pasos (una vez por sesion, si no la oculto).
  useEffect(() => {
    if (!sesion || sesion.debeCambiarContrasenia || ruta !== '/panel' || sesion.rol !== 'DUENIO') return
    try { if (sessionStorage.getItem('fidelapp.onb') === sesion.localId) return } catch { /* sin storage */ }
    try { sessionStorage.setItem('fidelapp.onb', sesion.localId) } catch { /* sin storage */ }
    api.personal.guia(sesion.localId).then((o) => { if (!o.descartada && o.completados < o.total) navegar('/panel/bienvenida') }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion?.localId, sesion?.debeCambiarContrasenia, ruta])
  // Marca blanca del local (nombre y color de acento)
  const localId = sesion?.localId
  useEffect(() => {
    if (!sesion || sesion.debeCambiarContrasenia) return
    obtenerOrigen().obtenerMarca(sesion).then((marca) => actualizar({ marca })).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localId])
  if (!listo || !sesion) return null
  return (
    <div style={marcaEstilo(sesion.marca.tono)} className="brand-scope min-h-dvh bg-background">
      <BarraLateral />
      <div className="lg:pl-[264px]">
        <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col md:max-w-[640px] lg:max-w-[1200px] lg:px-4 lg:py-6">
          <header className="sticky top-0 z-30 mb-2 flex h-[68px] flex-none items-center justify-between gap-3 border-b border-border bg-background px-[18px] lg:hidden">
            <span className="flex min-w-0 items-center gap-2.5"><Avatar nombre={sesion.marca.nombre} foto={sesion.marca.logoUrl} tamanio={44} tono={sesion.marca.tono} /><span className="display truncate text-[20px] leading-none tracking-[-.02em]">{sesion.marca.nombre}</span></span>
            <UsuarioMenu />
          </header>
          {sesion.rol === 'SOPORTE' && (
            <div role="status" className="mx-[18px] mb-2 flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-foreground px-4 py-3 text-[14px] font-medium text-background lg:mx-0">
              <span>Estás viendo <strong>{sesion.localNombre}</strong> como soporte del sistema. Solo lectura: no se puede modificar nada.</span>
              {sesion.locales && <Link to="/panel/locales" className="whitespace-nowrap font-semibold underline">Cambiar de local</Link>}
            </div>
          )}
          <GuiaPista />
          {ruta !== '/panel/suscripcion' && <SuscripcionAviso />}
          <Outlet />
          {!isFlujo(ruta) && <div className="h-[110px] flex-none lg:hidden" aria-hidden="true" />}
        </main>
      </div>
      {!isFlujo(ruta) && <div className="lg:hidden"><FlotanteNav /></div>}
    </div>
  )
}
