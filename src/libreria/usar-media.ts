import { useEffect, useState } from 'react'

/** true cuando la pantalla coincide con la media query (por ejemplo escritorio >= 1024 px). */
export function useMedia(consulta: string): boolean {
  const obtener = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(consulta).matches : false)
  const [on, fijarOn] = useState(obtener)
  useEffect(() => {
    const m = window.matchMedia(consulta)
    const h = () => fijarOn(m.matches)
    h()
    m.addEventListener('change', h)
    return () => m.removeEventListener('change', h)
  }, [consulta])
  return on
}
export const useEscritorio = () => useMedia('(min-width: 1024px)')
