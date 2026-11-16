import qrcode from 'qrcode-generator'

/** QR sobre blanco con modulos #1F1517. El SVG se arma desde la matriz de la libreria (no se inyecta HTML). */
export function QrCodigo({ valor, tamanio = 88, etiqueta }: { valor: string; tamanio?: number; etiqueta: string }) {
  const qr = qrcode(0, 'M')
  qr.addData(valor)
  qr.make()
  const n = qr.getModuleCount()
  const celdas: string[] = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) celdas.push(`M${c} ${r}h1v1h-1z`)
  return (
    <span role="img" aria-label={etiqueta} className="block flex-none rounded-[14px] bg-white p-[7px]">
      <svg viewBox={`0 0 ${n} ${n}`} width={tamanio} height={tamanio} shapeRendering="crispEdges" style={{ display: 'block' }}><path d={celdas.join('')} fill="#1F1517" /></svg>
    </span>
  )
}
