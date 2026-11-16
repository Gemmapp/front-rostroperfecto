import { Link } from 'react-router-dom'
import { useGuia } from '@/libreria/guia'

/** Cartel fijo cuando se llego desde la guia: dice en que paso se esta y como volver. */
export function GuiaPista() {
  const { guia } = useGuia()
  if (!guia) return null
  return (
    <div role="status" className="mx-[18px] mb-3 flex items-center justify-between gap-3 rounded-[14px] bg-accent-soft px-4 py-3 text-[15px] lg:mx-0">
      <span><strong>Paso {guia.n} de {guia.total}</strong> · {guia.titulo}. Cuando guardes, te llevamos al siguiente.</span>
      <Link to="/panel/bienvenida" className="whitespace-nowrap font-semibold underline">Ver la guía</Link>
    </div>
  )
}
