import { useEffect, useRef, useState } from 'react'
import { Boton } from '@/componentes/interfaz/boton'

const S = 280 // lado del visor cuadrado (px)
const Salida = 512 // lado de la imagen resultante (px)

/** Recorte cuadrado simple: arrastrar para mover, deslizador para acercar. Devuelve un File ya recortado. */
export function ImagenRecortador({ archivo, redondear, onCancelar, onHecho }: { archivo: File; redondear?: boolean; onCancelar: () => void; onHecho: (recortado: File) => void }) {
  const [url, fijarUrl] = useState<string>()
  const [dim, fijarDim] = useState<{ w: number; h: number }>()
  const [zoom, fijarZoom] = useState(1)
  const [apagado, fijarApagado] = useState({ x: 0, y: 0 })
  const [error, fijarError] = useState<string | null>(null)
  const img = useRef<HTMLImageElement | null>(null)
  const arrastrar = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    let vivo = true
    const u = URL.createObjectURL(archivo)
    fijarUrl(u)
    const i = new Image()
    i.onload = () => { if (!vivo) return; img.current = i; fijarDim({ w: i.naturalWidth, h: i.naturalHeight }); fijarError(null) }
    i.onerror = () => { if (vivo) fijarError('No pudimos leer la imagen. Probá con otra.') }
    i.src = u
    return () => { vivo = false; URL.revokeObjectURL(u) }
  }, [archivo])

  const escala = dim ? (S / Math.min(dim.w, dim.h)) * zoom : 1
  const limitar = (o: { x: number; y: number }, z = zoom) => {
    if (!dim) return o
    const sc = (S / Math.min(dim.w, dim.h)) * z
    const mx = Math.max(0, (dim.w * sc - S) / 2), my = Math.max(0, (dim.h * sc - S) / 2)
    return { x: Math.max(-mx, Math.min(mx, o.x)), y: Math.max(-my, Math.min(my, o.y)) }
  }
  const cambiarZoom = (z: number) => { fijarZoom(z); fijarApagado((o) => limitar(o, z)) }

  function hecho() {
    if (!dim || !img.current) return
    const c = document.createElement('canvas')
    c.width = c.height = Salida
    const ctx = c.getContext('2d')!
    const k = Salida / S
    ctx.drawImage(img.current, (S / 2 + apagado.x - (dim.w * escala) / 2) * k, (S / 2 + apagado.y - (dim.h * escala) / 2) * k, dim.w * escala * k, dim.h * escala * k)
    const type = archivo.type === 'image/png' ? 'image/png' : 'image/jpeg'
    c.toBlob((blob) => {
      if (!blob) { fijarError('No pudimos recortar la imagen. Probá de nuevo.'); return }
      onHecho(new File([blob], `foto.${type === 'image/png' ? 'png' : 'jpg'}`, { type }))
    }, type, 0.9)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Recortar foto" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="flex w-full max-w-[360px] flex-col gap-4 rounded-card-lg bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Recortá la foto</h2>
        <div
          className="relative mx-auto touch-none overflow-hidden bg-muted" style={{ width: S, height: S, borderRadius: redondear ? '50%' : 18 }}
          tabIndex={0} aria-label="Zona de recorte. Arrastrá para mover la foto"
          onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); arrastrar.current = { px: e.clientX, py: e.clientY, ox: apagado.x, oy: apagado.y } }}
          onPointerMove={(e) => { if (arrastrar.current) fijarApagado(limitar({ x: arrastrar.current.ox + e.clientX - arrastrar.current.px, y: arrastrar.current.oy + e.clientY - arrastrar.current.py })) }}
          onPointerUp={() => { arrastrar.current = null }}
          onKeyDown={(e) => { const d = 12; const m: Record<string, [number, number]> = { ArrowResta: [d, 0], ArrowRight: [-d, 0], ArrowUp: [0, d], ArrowAbajo: [0, -d] }; if (m[e.key]) { e.preventDefault(); fijarApagado((o) => limitar({ x: o.x + m[e.key][0], y: o.y + m[e.key][1] })) } }}>
          {url && dim && /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" draggable={false} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{ width: dim.w * escala, height: dim.h * escala, transform: `translate(calc(-50% + ${apagado.x}px), calc(-50% + ${apagado.y}px))` }} />}
        </div>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-muted-foreground">
          Acercar
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => cambiarZoom(Number(e.target.value))} className="h-11 w-full accent-[var(--primary-text)]" />
        </label>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Boton variante="secondary" tamanio="md" className="flex-1" onClick={onCancelar}>Cancelar</Boton>
          <Boton tamanio="md" className="flex-1" disabled={!dim} onClick={hecho}>Usar foto</Boton>
        </div>
      </div>
    </div>
  )
}
