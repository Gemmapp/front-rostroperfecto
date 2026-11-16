import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { EnlaceBoton } from '@/componentes/interfaz/boton'
import { Segmentado } from '@/componentes/interfaz/controles'
import { ListarFila, ServicioTarjeta } from '@/componentes/interfaz/visualizacion'
import { obtenerOrigen } from '@/libreria/datos'
import { sumarEtiqueta } from '@/libreria/datos/sumar'
import { ars } from '@/libreria/formato'
import { useCargar } from '@/libreria/ganchos'
import { isDuenio, useSesion } from '@/libreria/sesion'

export default function Servicios() {
  const navegar = useNavigate()
  const { sesion } = useSesion()
  const duenio = isDuenio(sesion)
  const { datos, error } = useCargar(() => obtenerOrigen().listarServicios(sesion!), [])
  const reglas = useCargar(() => obtenerOrigen().obtenerReglas(sesion!), [])
  const [vista, fijarVista] = useState<'cards' | 'list'>('cards')
  return (
    <div className="flex flex-col gap-4 px-[18px] pb-6 pt-6 lg:px-0 lg:pt-2">
      <header className="flex items-center justify-between">
        <h1 className="display text-[42px] leading-none tracking-[-.04em]">Servicios</h1>
        {duenio && <EnlaceBoton to="/panel/servicios/nuevo" tamanio="pastilla" variante="secondary" className="!w-auto">+ Nuevo</EnlaceBoton>}
      </header>
      <Segmentado etiqueta="Vista" valor={vista} onCambiar={fijarVista} opciones={[{ valor: 'cards', etiqueta: 'Tarjetas' }, { valor: 'list', etiqueta: 'Lista' }]} />
      {error && <Aviso>{error}</Aviso>}
      {datos?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-10 text-center">
          <p className="text-base font-semibold">Todavía no cargaste servicios</p>
          <p className="text-sm text-muted-foreground">Sin servicios no se pueden registrar visitas.</p>
          {duenio && <EnlaceBoton to="/panel/servicios/nuevo" tamanio="md" className="!w-auto">Cargar el primero</EnlaceBoton>}
        </div>
      )}
      {datos && datos.length > 0 && vista === 'cards' && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          {datos.map((s) => <ServicioTarjeta key={s.id} nombre={s.nombre} precio={ars(s.precio)} sumar={sumarEtiqueta(s, reglas.datos)} foto={s.foto} pausado={!s.activo} onClic={duenio ? () => navegar(`/panel/servicios/${s.id}`) : undefined} />)}
          {duenio && <Link to="/panel/servicios/nuevo" className="press grid min-h-[260px] place-items-center rounded-card border-[1.5px] border-dashed border-border text-[15px] font-semibold text-muted-foreground no-underline">+ Nuevo servicio</Link>}
        </div>
      )}
      {datos && datos.length > 0 && vista === 'list' && (
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-2">
          {datos.map((s) => (
            <li key={s.id}><ListarFila onClic={duenio ? () => navegar(`/panel/servicios/${s.id}`) : undefined} titulo={s.nombre} subtitulo={s.activo ? sumarEtiqueta(s, reglas.datos) : 'Pausado'} final={<span className="display text-xl tracking-tight">{ars(s.precio)}</span>} /></li>
          ))}
        </ul>
      )}
    </div>
  )
}
