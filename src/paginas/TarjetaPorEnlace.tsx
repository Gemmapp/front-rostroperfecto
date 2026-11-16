import { useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { ClienteTarjetaPantalla } from '@/componentes/tarjeta-cliente'
import { api } from '@/libreria/api/peticiones'
import { ApiError } from '@/libreria/api/http'
import type { TarjetaVista } from '@/libreria/api/tipos'
import { tarjetaDesdeApi } from '@/libreria/datos/tarjeta'
import { useQrToken } from '@/libreria/portal'

// Tarjeta del cliente por enlace personal, sin login (solo lectura). El enlace se trata como una contraseña.
export default function TarjetaPorEnlace() {
  const { token } = useParams() as { token: string }
  const [tarjeta, fijarTarjeta] = useState<TarjetaVista | null>(null)
  const [error, fijarError] = useState<string | null>(null)
  const muerto = useCallback(() => fijarError('Este enlace ya no es válido. Pedí uno nuevo en el local.'), [])
  const buscarQr = useMemo(() => () => api.publicTarjeta.qr(token), [token])
  const qr = useQrToken(buscarQr, !!tarjeta, muerto)

  useEffect(() => {
    api.publicTarjeta.obtener(token).then(fijarTarjeta).catch((e) => {
      if (e instanceof ApiError && e.estado === 429) fijarError('Demasiados intentos. Esperá unos minutos y probá de nuevo.')
      else if (e instanceof ApiError && e.estado === 404) muerto()
      else fijarError('No pudimos cargar tu tarjeta. Probá de nuevo.')
    })
  }, [token, muerto])

  if (error) return <main className="mx-auto max-w-[420px] p-[22px] pt-16"><Aviso>{error}</Aviso></main>
  if (!tarjeta) return null
  return <ClienteTarjetaPantalla vista={tarjetaDesdeApi(tarjeta, qr.token ?? tarjeta.qr.token)} />
}
