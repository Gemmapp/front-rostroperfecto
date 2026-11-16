import { Link } from 'react-router-dom'
import { useSuscripcion } from '@/libreria/suscripcion'

/** Aviso del estado de la suscripcion (solo dueño principal, y solo si está activada): últimos 7 días de prueba, fin de prueba, cobro pendiente y solo lectura. */
export function SuscripcionAviso() {
  const datos = useSuscripcion()
  if (!datos) return null
  let texto: string | null = null
  let urgente = false
  if (datos.estado === 'PRUEBA' && (datos.diasDePruebaRestantes ?? 99) <= 7) texto = `Te quedan ${datos.diasDePruebaRestantes} días de prueba. Hacé el pago para seguir.`
  else if (datos.estado === 'GRACIA') { texto = 'Tu prueba terminó. Hacé el pago para seguir operando.'; urgente = true }
  else if (datos.estado === 'IMPAGA') { texto = 'Venció tu último pago.'; urgente = true }
  else if (datos.estado === 'SOLO_LECTURA') { texto = 'Tu local está en solo lectura. Hacé el pago para volver a operar.'; urgente = true }
  if (!texto) return null
  return (
    <div role="status" className={`mx-[18px] mb-2 flex items-center justify-between gap-3 rounded-[14px] px-4 py-3 text-[15px] font-medium lg:mx-0 ${urgente ? 'bg-destructive/10 text-destructive' : 'bg-accent-soft'}`}>
      <span>{texto}</span>
      <Link to="/panel/suscripcion" className="whitespace-nowrap font-semibold underline">Ver cómo pagar</Link>
    </div>
  )
}
