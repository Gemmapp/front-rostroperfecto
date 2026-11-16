import { useParams } from 'react-router-dom'
import { ServicioFormulario } from '@/componentes/formulario-servicio'
import { Aviso } from '@/componentes/interfaz/aviso'
import { obtenerOrigen } from '@/libreria/datos'
import { useCargar } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

export default function EditarServicio() {
  const { id } = useParams() as { id: string }
  const { sesion } = useSesion()
  const { datos, error } = useCargar(async () => (await obtenerOrigen().listarServicios(sesion!)).find((s) => s.id === id) ?? null, [id])
  if (error) return <div className="p-[18px]"><Aviso>{error}</Aviso></div>
  if (datos === null) return null
  return <ServicioFormulario servicio={datos} />
}
