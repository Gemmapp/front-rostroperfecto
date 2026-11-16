import { useEffect, useRef, useState } from 'react'

/** Cuenta animada con ease-out cubico (800-1100 ms). Respeta prefers-reduced-motion. */
export function useCantidadUp(destino: number, ms = 800, demora = 0) {
  const [v, fijarV] = useState(0)
  const desde = useRef(0)
  useEffect(() => {
    const reducir = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducir) { desde.current = destino; fijarV(destino); return }
    let raf = 0
    const inicio = desde.current
    const t0 = performance.now() + demora
    const tick = (ahora: number) => {
      const k = Math.max(0, Math.min(1, (ahora - t0) / ms))
      const actual = inicio + (destino - inicio) * (1 - Math.pow(1 - k, 3))
      desde.current = actual
      fijarV(actual)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [destino, ms, demora])
  return v
}

/** Carga asincrona simple con estado de error (mensaje en espanol). */
export function useCargar<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [datos, fijarDatos] = useState<T | null>(null)
  const [error, fijarError] = useState<string | null>(null)
  const [tick, fijarTick] = useState(0)
  useEffect(() => {
    let vivo = true
    fijarError(null)
    fn().then((d) => vivo && fijarDatos(d)).catch((e: unknown) => vivo && fijarError(errMensaje(e)))
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { datos, error, recargar: () => fijarTick((t) => t + 1), fijarDatos }
}

export function errMensaje(e: unknown): string {
  const x = e as { usuarioMensaje?: string; mensaje?: string }
  return x?.usuarioMensaje ?? x?.mensaje ?? 'Algo salió mal. Probá de nuevo.'
}
