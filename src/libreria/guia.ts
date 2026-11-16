import { useLocation, useNavigate } from 'react-router-dom'

/** Paso de la guia de primeros pasos desde el que se llego a una pantalla (viaja en el estado de la navegacion). */
export interface GuiaEstado { key: string; n: number; total: number; titulo: string }

export function useGuia() {
  const loc = useLocation()
  const navegar = useNavigate()
  const guia = (loc.state as { guia?: GuiaEstado } | null)?.guia
  /** Al terminar el paso: vuelve a la guia (con el paso tachado y el siguiente resaltado). Devuelve false si no venia de la guia. */
  const terminar = (): boolean => {
    if (!guia) return false
    navegar('/panel/bienvenida', { replace: true, state: { recienHecho: guia } })
    return true
  }
  return { guia, terminar }
}
