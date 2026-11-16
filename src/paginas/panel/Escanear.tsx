import { Navigate, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Boton } from '@/componentes/interfaz/boton'
import { Aviso } from '@/componentes/interfaz/aviso'
import { ApiError } from '@/libreria/api/http'
import { obtenerOrigen } from '@/libreria/datos'
import { errMensaje } from '@/libreria/ganchos'
import { useEscritorio } from '@/libreria/usar-media'
import { useSesion } from '@/libreria/sesion'

interface Detector { detectar(origen: CanvasImageSource): Promise<{ crudoValor: string }[]> }
declare global { interface Window { BarcodeDetector?: new (o: { formatos: string[] }) => Detector } }

const esquina = 'absolute size-12 border-primary'

export default function Escanear() {
  const navegar = useNavigate()
  const { sesion } = useSesion()
  const escritorio = useEscritorio()
  const video = useRef<HTMLVideoElement>(null)
  const [camara, fijarCamara] = useState<'idle' | 'on' | 'unsupported'>('idle')
  const [error, fijarError] = useState<string | null>(null)

  const identificar = useCallback(async (token: string) => {
    fijarError(null)
    try {
      const c = await obtenerOrigen().identificarByQr(sesion!, token)
      navegar(`/panel/registrar?c=${c.id}`)
    } catch (e) {
      const codigo = e instanceof ApiError ? e.problema.codigo : undefined
      fijarError(codigo === 'QR_VENCIDO' ? 'El QR venció. Pedile al cliente que lo renueve en su celular.' : codigo === 'QR_INVALIDO' ? 'Ese QR no es válido.' : errMensaje(e))
    }
  }, [navegar, sesion])

  // Camara real con BarcodeDetector si el navegador lo trae.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.BarcodeDetector || !navigator.mediaDevices?.getUserMedia) { fijarCamara('unsupported'); return }
    let detener = false
    let flujo: MediaStream | undefined
    ;(async () => {
      try {
        flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (detener || !video.current) return
        video.current.srcObject = flujo
        await video.current.play()
        fijarCamara('on')
        const det = new window.BarcodeDetector!({ formatos: ['qr_code'] })
        while (!detener) {
          const encontrado = await det.detectar(video.current).catch(() => [])
          if (encontrado[0]) { await identificar(encontrado[0].crudoValor); return }
          await new Promise((r) => setTimeout(r, 300))
        }
      } catch { fijarCamara('unsupported') }
    })()
    return () => { detener = true; flujo?.getTracks().forEach((t) => t.stop()) }
  }, [identificar])

  // En computadora no hay cámara para leer el QR: se busca al cliente por nombre o DNI.
  if (escritorio) return <Navigate to="/panel/clientes?elegir=1" replace />

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-56px)] w-full flex-col items-center gap-5 overflow-hidden bg-[#1A1214] px-[22px] pb-[30px] pt-[22px] text-[#F8EFF1] lg:my-0 lg:min-h-[calc(100dvh-48px)] lg:max-w-[560px] lg:rounded-[28px]">
      <div className="relative flex w-full items-center justify-between">
        <Boton variante="inverso" tamanio="pastilla" className="!w-auto" onClick={() => navegar('/panel')}>Cancelar</Boton>
        <span className="font-mono text-xs tracking-[.06em] text-[#B3A2A6]">ESCÁNER</span>
        <span className="w-[84px]" />
      </div>
      <h1 className="display relative mt-5 text-center text-[40px] leading-none tracking-[-.035em]">Apuntá al QR<br />de la tarjeta</h1>
      <div className="relative mt-3.5 size-[250px]">
        <video ref={video} muted playsInline className={camara === 'on' ? 'absolute inset-0 size-full rounded-[18px] object-cover' : 'hidden'} aria-label="Cámara" />
        <span className={`${esquina} left-0 top-0 rounded-tl-[18px] border-l-4 border-t-4`} />
        <span className={`${esquina} right-0 top-0 rounded-tr-[18px] border-r-4 border-t-4`} />
        <span className={`${esquina} bottom-0 left-0 rounded-bl-[18px] border-b-4 border-l-4`} />
        <span className={`${esquina} bottom-0 right-0 rounded-br-[18px] border-b-4 border-r-4`} />
        <span aria-hidden="true" className="absolute inset-x-3.5 h-[3px] rounded-[3px] bg-primary shadow-[0_0_24px_4px_var(--primary)] motion-safe:animate-[scan_2.6s_ease-in-out_infinite]" style={{ top: '5%' }} />
      </div>
      {camara === 'unsupported' && <p className="relative max-w-[280px] text-center text-sm text-[#B3A2A6]">Este navegador no puede leer el QR con la cámara. Buscá al cliente por nombre o DNI.</p>}
      {error && <Aviso className="relative !text-[#FFB4A8]">{error}</Aviso>}
      <div className="flex-1" />
      <Boton variante="texto" tamanio="md" className="relative !text-[#B3A2A6]" onClick={() => navegar('/panel/clientes?elegir=1')}>Buscar por nombre</Boton>
    </div>
  )
}
