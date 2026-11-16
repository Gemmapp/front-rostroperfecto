import { Navigate } from 'react-router-dom'
import { Aviso } from '@/componentes/interfaz/aviso'
import { SeccionTitulo } from '@/componentes/interfaz/visualizacion'
import { api } from '@/libreria/api/peticiones'
import { cn } from '@/libreria/clases'
import { ars, largoFecha, cortoFechaHora } from '@/libreria/formato'
import { useCargar } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'
import { isDuenio } from '@/libreria/sesion'

const EstadoTexto: Record<string, string> = {
  PRUEBA: 'Prueba gratis', GRACIA: 'Falta el pago', ACTIVA: 'Al día', IMPAGA: 'Pago vencido', CANCELADA: 'Cancelada', SOLO_LECTURA: 'Solo lectura',
}
const PagarTexto: Record<string, string> = { APROBADO: 'Recibido', RECHAZADO: 'Rechazado', PENDIENTE: 'Pendiente' }
const Soporte = import.meta.env.VITE_SUPPORT_URL ?? 'mailto:soporte@example.com'

/** Solo el dueño (y el soporte, para ver): el servidor igual responde 403 al resto. */
export default function Suscripcion() {
  const { sesion } = useSesion()
  if (!isDuenio(sesion)) return <Navigate to="/panel" replace state={{ aviso: 'La suscripción la maneja el dueño del local.' }} />
  return <SuscripcionInterno />
}

function SuscripcionInterno() {
  const { sesion } = useSesion()
  const localId = sesion!.localId
  const sub = useCargar(() => api.personal.suscripcion(localId), [localId])
  const pays = useCargar(() => api.personal.suscripcionPayments(localId), [localId])
  const s = sub.datos
  const alDia = s?.estado === 'ACTIVA' || s?.estado === 'PRUEBA'

  return (
    <div className="flex flex-col gap-[18px] px-[18px] pb-10 pt-4 lg:px-0 lg:pt-2">
      <h1 className="display text-[42px] leading-none tracking-[-.04em]">Mi suscripción</h1>
      {sub.error && <Aviso>{sub.error}</Aviso>}
      {s && !s.habilitado && <Navigate to="/panel" replace />}
      {s && s.habilitado && (
        <>
          <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-[18px]" aria-label="Estado">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex flex-col"><SeccionTitulo>Plan único</SeccionTitulo><span className="text-[22px] font-semibold">{ars(s.precioMensualARS)}<span className="text-sm font-normal text-muted-foreground"> / mes</span></span></span>
              <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', alDia ? 'bg-accent-soft' : 'bg-destructive/10 text-destructive')}>{EstadoTexto[s.estado] ?? s.estado}</span>
            </div>
            {s.estado === 'PRUEBA' && <p className="m-0 text-[15px]">Te quedan {s.diasDePruebaRestantes ?? 0} días de prueba gratis con todo incluido. La prueba termina el {s.finPruebaEn ? largoFecha(s.finPruebaEn) : ''}.</p>}
            {s.estado === 'GRACIA' && <p className="m-0 text-[15px]">Tu prueba terminó. Hacé el pago para seguir operando; mientras tanto todo sigue activo unos días.</p>}
            {s.estado === 'ACTIVA' && s.pagadoHasta && <p className="m-0 text-[15px] text-muted-foreground">Tu suscripción está paga hasta el {largoFecha(s.pagadoHasta)}.</p>}
            {s.estado === 'IMPAGA' && <p className="m-0 text-[15px]">Venció tu último pago. Hacé la transferencia para no perder el acceso.</p>}
            {s.estado === 'SOLO_LECTURA' && <p className="m-0 text-[15px]">La prueba o el pago terminó. Tus datos están a salvo y podés verlos, pero no cargar nada nuevo hasta que se registre el pago.</p>}
          </section>

          {s.estado !== 'ACTIVA' && (
            <section className="flex flex-col gap-2 rounded-card bg-accent-soft p-[18px]" aria-label="Cómo pagar">
              <SeccionTitulo>Cómo pagar</SeccionTitulo>
              <p className="m-0 text-[15px] leading-snug">El pago es mensual, por transferencia, de <strong>{ars(s.precioMensualARS)}</strong>.</p>
              {s.datosTransferencia ? <p className="m-0 whitespace-pre-line rounded-[14px] bg-card p-3.5 text-[15px] font-medium leading-snug">{s.datosTransferencia}</p> : <p className="m-0 text-[15px] leading-snug">Escribinos y te pasamos los datos de la cuenta.</p>}
              <p className="m-0 text-[15px] leading-snug">Después mandanos el comprobante y en el día registramos el pago.</p>
              <a className="text-[15px] font-semibold text-primary-text" href={Soporte}>Enviar comprobante</a>
            </section>
          )}
        </>
      )}

      <section className="flex flex-col gap-2" aria-label="Mis pagos">
        <SeccionTitulo>Mis pagos</SeccionTitulo>
        {pays.error && <Aviso>{pays.error}</Aviso>}
        {pays.datos && pays.datos.contenido.length === 0 && <p className="m-0 rounded-card border border-border bg-card p-[18px] text-[15px] text-muted-foreground">Todavía no hay pagos. Durante la prueba no se cobra nada.</p>}
        {pays.datos && pays.datos.contenido.length > 0 && (
          <div className="overflow-x-auto rounded-card border border-border bg-card">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead><tr className="text-sm text-muted-foreground"><th className="p-3 font-medium">Fecha</th><th className="p-3 font-medium">Concepto</th><th className="p-3 text-right font-medium">Monto</th><th className="p-3 font-medium">Estado</th></tr></thead>
              <tbody>{pays.datos.contenido.map((p) => (
                <tr key={p.id} className="border-t border-border"><td className="p-3">{cortoFechaHora(p.fecha)}</td><td className="p-3">{p.concepto}</td><td className="p-3 text-right">{ars(p.montoARS)}</td><td className="p-3 font-medium">{PagarTexto[p.estado] ?? p.estado}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
