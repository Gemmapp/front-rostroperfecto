import { Link } from 'react-router-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Suspense, useEffect, useState } from 'react'
import { Aviso } from '@/componentes/interfaz/aviso'
import { Boton, EnlaceBoton } from '@/componentes/interfaz/boton'
import { Avatar, NivelEtiqueta } from '@/componentes/interfaz/visualizacion'
import { cn } from '@/libreria/clases'
import { obtenerOrigen } from '@/libreria/datos'
import type { Cliente, ClienteFiltro } from '@/libreria/datos/tipos'
import { ars, dniDigitos, dniFormato } from '@/libreria/formato'
import { errMensaje } from '@/libreria/ganchos'
import { useSesion } from '@/libreria/sesion'

const Filtros: { v: ClienteFiltro; l: string }[] = [{ v: 'TODAS', l: 'Todas' }, { v: 'ORO', l: 'Oro' }, { v: 'PLATA', l: 'Plata' }, { v: 'BASE', l: 'Base' }, { v: 'SIN_VOLVER', l: 'Sin volver' }]
const ultimo = (d: Cliente['diasDesde']) => (d === undefined ? '' : d === null ? 'Todavía no vino' : d === 0 ? 'Vino hoy' : d === 1 ? 'Vino ayer' : `Vino hace ${d} días`)

function Clientes() {
  const navegar = useNavigate()
  const elegir = useSearchParams()[0].get('elegir') === '1'
  const { sesion } = useSesion()
  const [q, fijarQ] = useState('')
  const [filtro, fijarFiltro] = useState<ClienteFiltro>('TODAS')
  const [filas, fijarFilas] = useState<Cliente[] | null>(null)
  const [pagina, fijarPagina] = useState(0)
  const [tieneMas, fijarTieneMas] = useState(false)
  const [cargando, fijarCargando] = useState(false)
  const [error, fijarError] = useState<string | null>(null)
  // Carga incremental: pagina 0 al cambiar busqueda o filtro; "Ver más" agrega la siguiente.
  useEffect(() => {
    let vivo = true
    fijarCargando(true)
    obtenerOrigen().listarClientes(sesion!, q, filtro, pagina)
      .then((r) => { if (!vivo) return; fijarFilas((previo) => (pagina === 0 ? r.items : [...(previo ?? []), ...r.items])); fijarTieneMas(r.tieneMas); fijarError(null) })
      .catch((e) => vivo && fijarError(errMensaje(e)))
      .finally(() => vivo && fijarCargando(false))
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtro, pagina])
  const datos = filas

  return (
    <div className="flex flex-col gap-4 px-[18px] pb-6 pt-6 lg:px-0 lg:pt-2">
      <header className="flex items-center justify-between">
        <h1 className="display text-[42px] leading-none tracking-[-.04em]">{elegir ? 'Elegí un cliente' : 'Clientes'}</h1>
        <EnlaceBoton to="/panel/clientes/nuevo" tamanio="pastilla" variante="secondary" className="!w-auto">+ Nueva</EnlaceBoton>
      </header>
      <label className="fld flex h-[54px] items-center rounded-field border-[1.5px] border-border bg-card px-[18px]">
        <span className="sr-only">Buscar por nombre o DNI</span>
        <input type="search" inputMode="search" placeholder="Buscar por nombre o DNI" value={q} onChange={(e) => { fijarPagina(0); fijarQ(/^[\d.]+$/.test(e.target.value) ? dniFormato(dniDigitos(e.target.value)) : e.target.value) }} className="w-full border-0 bg-transparent text-[17px] font-medium text-foreground outline-none placeholder:text-muted-foreground/70" />
      </label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros">
        {Filtros.map((f) => (
          <button key={f.v} type="button" aria-pressed={filtro === f.v} onClick={() => { fijarPagina(0); fijarFiltro(f.v) }}
            className={cn('h-11 rounded-full px-4 text-sm font-semibold', filtro === f.v ? 'bg-foreground text-background' : 'border border-border bg-card text-foreground')}>{f.l}</button>
        ))}
      </div>
      {error && <Aviso>{error}</Aviso>}
      {datos && datos.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-10 text-center">
          <p className="text-base font-semibold">No encontramos clientes</p>
          <p className="text-sm text-muted-foreground">{q ? 'Probá con otro nombre o DNI, o dala de alta.' : 'Todavía no hay clientes con este filtro.'}</p>
          <EnlaceBoton to="/panel/clientes/nuevo" tamanio="md" className="!w-auto">Dar de alta una cliente</EnlaceBoton>
        </div>
      )}
      <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-2 xl:grid-cols-3 lg:gap-3">
        {(filas ?? []).map((c, i) => {
          const body = (
            <>
              <Avatar nombre={c.nombre} foto={c.foto} tamanio={46} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                <span className="flex items-center gap-2"><span className="truncate text-base font-semibold">{c.nombre}</span><NivelEtiqueta nivel={c.nivel} /></span>
                <span className="text-[13px]" style={{ color: c.diasDesde != null && c.diasDesde > 60 ? 'var(--destructive)' : 'var(--muted-foreground)' }}>{ultimo(c.diasDesde) || `DNI ${dniFormato(c.dni)}`}</span>
              </span>
              <span className="display tnum text-xl tracking-tight">{ars(c.saldo)}</span>
            </>
          )
          const clases = 'rise press flex min-h-[68px] w-full items-center gap-3 rounded-[20px] border border-border bg-card p-3 text-foreground no-underline'
          return (
            <li key={c.id} style={{ ['--i' as string]: Math.min(i, 6) }}>
              {elegir
                ? <button type="button" className={cn(clases, 'cursor-pointer')} onClick={() => navegar(`/panel/registrar?c=${c.id}`)}>{body}</button>
                : <Link to={`/panel/clientes/${c.id}`} className={clases}>{body}</Link>}
            </li>
          )
        })}
      </ul>
      {tieneMas && <Boton variante="secondary" tamanio="md" className="w-full lg:mx-auto lg:w-auto lg:min-w-[240px]" disabled={cargando} onClick={() => fijarPagina((p) => p + 1)}>{cargando ? 'Cargando…' : 'Ver más'}</Boton>}
      {elegir && <Boton variante="texto" tamanio="md" onClick={() => navegar('/panel/escanear')}>Volver al escáner</Boton>}
    </div>
  )
}

export default function Pagina() {
  return <Suspense fallback={null}><Clientes /></Suspense>
}
