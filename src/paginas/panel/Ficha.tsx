import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton, EnlaceBoton } from '@/componentes/interfaz/boton'
import { Avatar, NivelEtiqueta, SeccionTitulo, DatoTarjeta } from '@/componentes/interfaz/visualizacion'
import { obtenerOrigen } from '@/libreria/datos'
import type { TarjetaEnlace } from '@/libreria/datos/tipos'
import { instagramUrl, instagramUsuario, origenEtiqueta, validoWaTelefono, whatsappUrl } from '@/libreria/datos/origen'
import { ars, arsFirmado, dniFormato, largoFecha } from '@/libreria/formato'
import { errMensaje, useCargar } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'
import { urlPublica } from '@/libreria/enlaces'

function TarjetaEnlaceCaja({ clienteId, clienteNombre, waTelefono }: { clienteId: string; clienteNombre: string; waTelefono?: string }) {
  const { sesion } = useSesion()
  const origen = obtenerOrigen()
  const estado = useCargar(() => origen.obtenerTarjetaEnlace(sesion!, clienteId), [clienteId])
  const [reciente, fijarReciente] = useState<TarjetaEnlace | null>(null)
  const [mensaje, fijarMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const activo = reciente?.activo ?? estado.datos?.activo
  const localNombre = useSesion().sesion!.marca.nombre
  const url = reciente?.ruta ? urlPublica(reciente.ruta) : null

  async function crear() {
    fijarMensaje(null)
    try { fijarReciente(await origen.crearTarjetaEnlace(sesion!, clienteId)) } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) }
  }
  async function revocar() {
    fijarMensaje(null)
    try { await origen.revocarTarjetaEnlace(sesion!, clienteId); fijarReciente({ activo: false }); fijarMensaje({ ok: true, texto: 'Enlace revocado.' }) } catch (e) { fijarMensaje({ ok: false, texto: errMensaje(e) }) }
  }
  async function copiar() {
    try { await navigator.clipboard.writeText(url!); fijarMensaje({ ok: true, texto: 'Enlace copiado.' }) } catch { fijarMensaje({ ok: false, texto: 'No pudimos copiarlo. Seleccionalo y copialo a mano.' }) }
  }
  return (
    <section className="flex flex-col gap-2" aria-label="Enlace de la tarjeta">
      <SeccionTitulo>Tarjeta del cliente</SeccionTitulo>
      <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px]">
        <p className="text-sm leading-snug text-muted-foreground">Con este enlace el cliente ve sus puntos y movimientos sin entrar con usuario. Tratalo como una contraseña: quien lo tenga puede ver su tarjeta.</p>
        {url && <input readOnly value={url} aria-label="Enlace personal" onFocus={(e) => e.currentTarget.select()} className="h-11 w-full rounded-[14px] border border-border bg-background px-3 text-sm" />}
        {url && <p className="text-[13px] text-muted-foreground">Este enlace se muestra una sola vez. Si lo perdés, generá uno nuevo.</p>}
        {url && !validoWaTelefono(waTelefono) && <p id="wa-aviso" className="text-[13px] text-muted-foreground">Para enviarlo por WhatsApp, cargá un teléfono válido en la ficha del cliente.</p>}
        {mensaje && <Aviso ok={mensaje.ok} className="text-sm">{mensaje.texto}</Aviso>}
        <div className="flex flex-wrap gap-2">
          {url && <Boton tamanio="md" className="!w-auto" onClick={copiar}>Copiar enlace</Boton>}
          {url && (validoWaTelefono(waTelefono)
            ? <a href={whatsappUrl(waTelefono!, clienteNombre.split(' ')[0], localNombre, url)} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-field bg-primary px-5 text-[15px] font-semibold text-primary-foreground no-underline shadow-primary" style={{ color: 'var(--primary-foreground)' }}>Enviar por WhatsApp</a>
            : <Boton tamanio="md" className="!w-auto" disabled aria-describedby="wa-aviso">Enviar por WhatsApp</Boton>)}
          <Boton tamanio="md" variante={url ? 'secondary' : 'principal'} className="!w-auto" onClick={crear}>{activo ? 'Generar uno nuevo' : 'Generar enlace'}</Boton>
          {activo && <Boton tamanio="md" variante="danger" className="!w-auto" onClick={revocar}>Revocar</Boton>}
        </div>
      </div>
    </section>
  )
}

export default function Ficha() {
  const { id } = useParams() as { id: string }
  const navegar = useNavigate()
  const { sesion } = useSesion()
  const origen = obtenerOrigen()
  const cliente = useCargar(() => origen.obtenerCliente(sesion!, id), [id])
  const mueve = useCargar(() => origen.clienteMovimientos(sesion!, id), [id])
  const c = cliente.datos
  const st = c?.sellos

  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-24 pt-[18px] lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:px-0 lg:pb-10 lg:pt-2">
      <div className="flex items-center justify-between lg:col-span-2">
        <Boton variante="secondary" tamanio="pastilla" className="!w-auto" onClick={() => navegar('/panel/clientes')}>‹ Clientes</Boton>
        {c && <EnlaceBoton to={`/panel/clientes/${c.id}/editar`} variante="texto" tamanio="pastilla" className="!w-auto">Editar ficha</EnlaceBoton>}
      </div>
      {cliente.error && <Aviso className="lg:col-span-2">{cliente.error}</Aviso>}
      {c && (
        <>
          <div className="flex flex-col gap-[18px]">
          <section className="rise flex flex-col gap-3.5 rounded-client bg-[#2A1D21] p-[22px] text-[#FAF2F3]">
            <div className="flex items-center gap-3.5">
              <Avatar nombre={c.nombre} foto={c.foto} tamanio={56} />
              <div className="flex flex-1 flex-col gap-1"><h1 className="text-[22px] font-semibold leading-tight tracking-[-.01em]">{c.nombre}</h1><NivelEtiqueta nivel={c.nivel} className="self-start" /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-[#FAF2F3]/70">{c.puntos !== undefined ? 'Puntos' : 'Disponible para usar'}</span>
              {c.puntos !== undefined
                ? <span className="display tnum text-[64px] leading-[.9] tracking-[-.04em]">{c.puntos}</span>
                : <span className="display tnum text-[64px] leading-[.9] tracking-[-.04em]">{ars(c.saldo)}</span>}
              {c.puntos !== undefined && <span className="self-start rounded-full bg-white/10 px-3 py-1.5 text-[13px]">equivalen a {ars(c.saldo)}</span>}
            </div>
            {c.siguienteNivel?.nivel && c.siguienteNivel.falta !== undefined && <p className="text-[13px] text-[#FAF2F3]/70">Le faltan {ars(c.siguienteNivel.falta)} para {c.siguienteNivel.nivel === 'oro' ? 'Oro' : 'Plata'}.</p>}
          </section>
          <EnlaceBoton to={`/panel/registrar?c=${c.id}`}>Registrar servicio</EnlaceBoton>
          <div className="grid grid-cols-3 gap-2.5">
            <DatoTarjeta className="!p-3.5" etiqueta="Visitas" valor={c.visitas} />
            <DatoTarjeta className="!p-3.5" etiqueta="Última visita" valor={<span className="text-[22px]">{c.diasDesde == null ? '–' : c.diasDesde === 0 ? 'Hoy' : `${c.diasDesde} d`}</span>} />
            <DatoTarjeta className="!p-3.5" etiqueta="Premio" valor={st?.habilitado && st.total ? <span className="text-[22px]">{st.hecho} de {st.total}</span> : '–'} />
          </div>
          <section className="flex flex-col gap-2">
            <SeccionTitulo>Datos</SeccionTitulo>
            <dl className="m-0 rounded-card border border-border bg-card px-[18px] py-1.5">
              {([['DNI', dniFormato(c.dni)], ['WhatsApp', c.telefono], ['Cumpleaños', c.cumpleanios && largoFecha(c.cumpleanios + 'T12:00:00')], ['Nota', c.nota], ['¿Cómo nos conoció?', c.origen ? origenEtiqueta(c.origen) : undefined], ['Cliente desde', c.desde && largoFecha(c.desde)]] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-3 text-[15px] last:border-b-0"><dt className="text-muted-foreground">{k}</dt><dd className="m-0 text-right font-medium">{v}</dd></div>
              ))}
              {c.instagram && (
                <div className="flex justify-between gap-4 border-t border-border py-1 text-[15px]"><dt className="self-center text-muted-foreground">Instagram</dt>
                  <dd className="m-0 text-right font-medium"><a href={instagramUrl(c.instagram)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-primary-text">@{instagramUsuario(c.instagram)}</a></dd></div>
              )}
            </dl>
          </section>
          </div>
          <div className="flex flex-col gap-[18px]">
          <TarjetaEnlaceCaja clienteId={c.id} clienteNombre={c.nombre} waTelefono={c.waTelefono} />
          <section className="flex flex-col gap-2">
            <SeccionTitulo>Historial</SeccionTitulo>
            {mueve.error && <Aviso>{mueve.error}</Aviso>}
            {mueve.datos?.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay movimientos.</p>}
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {mueve.datos?.map((m) => (
                <li key={m.id} className="flex min-h-16 items-center gap-3.5 rounded-[18px] border border-border bg-card p-3">
                  <span className="display grid size-10 flex-none place-items-center rounded-[14px] text-xl" style={{ background: m.tipo === 'earn' ? 'var(--primary)' : 'var(--muted)', color: m.tipo === 'earn' ? 'var(--primary-foreground)' : 'var(--foreground)' }} aria-hidden="true">{m.tipo === 'earn' ? '+' : m.tipo === 'redeem' ? '−' : '×'}</span>
                  <span className="flex flex-1 flex-col gap-0.5"><span className="text-base font-medium">{m.titulo}</span><span className="text-[13px] text-muted-foreground">{largoFecha(m.fecha)}</span></span>
                  <span className="display tnum text-xl tracking-tight" style={{ color: m.tipo === 'earn' ? 'var(--success)' : m.tipo === 'expire' ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{arsFirmado(m.monto)}</span>
                </li>
              ))}
            </ul>
          </section>
          </div>
        </>
      )}
    </div>
  )
}
