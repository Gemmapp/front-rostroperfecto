import { useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton } from '@/componentes/interfaz/boton'
import { ClienteTarjetaPantalla } from '@/componentes/tarjeta-cliente'
import { api } from '@/libreria/api/peticiones'
import type { TarjetaVista } from '@/libreria/api/tipos'
import { tarjetaDesdeApi } from '@/libreria/datos/tarjeta'
import { restaurarClienteSesion, fijarClienteSesion, useQrToken } from '@/libreria/portal'

export default function Cuenta() {
  const { localId } = useParams() as { localId: string }
  const navegar = useNavigate()
  const [ok, fijarOk] = useState(false)
  const [tarjeta, fijarTarjeta] = useState<TarjetaVista | null>(null)
  const [error, fijarError] = useState<string | null>(null)
  const salir = useCallback(() => { fijarClienteSesion(localId, null); navegar(`/l/${localId}`, { replace: true }) }, [localId, navegar])

  useEffect(() => {
    if (!restaurarClienteSesion(localId)) { navegar(`/l/${localId}`, { replace: true }); return }
    fijarOk(true)
  }, [localId, navegar])
  // El QR rota cada 60 s: se renueva antes de vencer.
  const qr = useQrToken(api.portal.qrToken, ok, salir)

  useEffect(() => {
    if (!ok) return
    api.portal.tarjeta(localId).then(fijarTarjeta).catch((e) => (e?.status === 401 ? salir() : fijarError('No pudimos cargar tu tarjeta. Probá de nuevo.')))
  }, [ok, localId, salir])

  if (error) return <main className="mx-auto max-w-[420px] p-[18px]"><Aviso>{error}</Aviso></main>
  if (!tarjeta) return null
  return (
    <>
      <ClienteTarjetaPantalla vista={tarjetaDesdeApi(tarjeta, qr.token ?? tarjeta.qr.token)} />
      <div className="mx-auto max-w-[420px] px-[18px] pb-10">
        {qr.fallido && <Aviso className="mb-2">No pudimos renovar tu QR. Revisá tu conexión.</Aviso>}
        <Boton variante="texto" tamanio="md" className="w-full" onClick={salir}>Salir</Boton>
      </div>
    </>
  )
}
