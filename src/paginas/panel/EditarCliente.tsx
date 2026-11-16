import { useParams } from 'react-router-dom'
import { ClienteFormulario } from '@/componentes/formulario-cliente'
import { Aviso } from '@/componentes/interfaz/aviso'
import { obtenerOrigen } from '@/libreria/datos'
import { useCargar } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

export default function EditarCliente() {
  const { id } = useParams() as { id: string }
  const { sesion } = useSesion()
  const { datos, error } = useCargar(() => obtenerOrigen().obtenerCliente(sesion!, id), [id])
  if (error) return <div className="p-[18px]"><Aviso>{error}</Aviso></div>
  return datos ? <ClienteFormulario cliente={datos} /> : null
}
