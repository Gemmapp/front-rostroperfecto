// Fuente de DATOS DE EJEMPLO (los del handoff), sin backend: NEXT_PUBLIC_DATA_SOURCE=sample.
// Hace de "servidor falso" en memoria. En el uso normal la app consume la API real (api-source.ts).
import type { Cliente, InicioEstadisticas, DatosOrigen, Comprobante, Reglas, ServicioElemento, Sesion, VisitaVistaPrevia } from './tipos'

const demora = <T,>(v: T, ms = 100) => new Promise<T>((r) => setTimeout(() => r(v), ms))
let sec = 100

export function crearEjemploOrigen(): DatosOrigen {
  const clientes: Cliente[] = [
    { id: 'c1', nombre: 'Sofía Aguirre', dni: '38455210', telefono: '11 5555 1020', waTelefono: '5491155551020', origen: 'instagram', instagram: '@sofiaaguirre', cumpleanios: '1992-05-14', nota: 'Prefiere turnos a la tarde.', nivel: 'plata', saldo: 8450, puntos: 845, diasDesde: 12, visitas: 8, desde: '2025-03-10', siguienteNivel: { nivel: 'oro', falta: 3550, porcentaje: 70 }, sellos: { habilitado: true, total: 5, hecho: 3, premioNombre: 'Manicura semipermanente' } },
    { id: 'c2', nombre: 'Lucía Benítez', dni: '36120987', telefono: '11 4444 8821', nivel: 'oro', saldo: 12300, puntos: 1230, diasDesde: 3, visitas: 21, desde: '2024-08-02', siguienteNivel: { porcentaje: 100 } },
    { id: 'c3', nombre: 'Martina Gómez', dni: '40231456', telefono: '11 6000 1234', nivel: 'base', saldo: 1800, puntos: 180, diasDesde: 75, visitas: 3, desde: '2025-06-18', siguienteNivel: { nivel: 'plata', falta: 30000, porcentaje: 40 } },
    { id: 'c4', nombre: 'Camila Ríos', dni: '35789012', nivel: 'plata', saldo: 5200, puntos: 520, diasDesde: 48, visitas: 9, desde: '2025-01-22', siguienteNivel: { nivel: 'oro', falta: 60000, porcentaje: 40 } },
  ]
  const servicios: ServicioElemento[] = [
    { id: 's1', nombre: 'Manicura semipermanente', precio: 14000, modo: 'pct', pct: 5, activo: true, sumar: 700 },
    { id: 's2', nombre: 'Esculpidas en gel', precio: 22000, modo: 'pct', pct: 5, activo: true, sumar: 1100 },
    { id: 's3', nombre: 'Pedicuría spa', precio: 16000, modo: 'fixed', fijo: 600, activo: true, sumar: 600 },
    { id: 's4', nombre: 'Diseño de cejas', precio: 9000, modo: 'pct', pct: 8, activo: false, sumar: 720 },
  ]
  const reglas: Reglas = { devolucionModo: 'PORCENTAJE', puntosPorServicio: 10, pct: 5, puntoValor: 10, meses: 12, tope: 30, premio: { on: true, n: 5, servicioId: 's1' }, niveles: { plataDesde: 50000, oroDesde: 150000, bonusPlataPct: 10, bonusOroPct: 20 } }
  const notified = new Set<string>()
  const sumarFor = (s: ServicioElemento) => (reglas.devolucionModo === 'PUNTOS' ? reglas.puntosPorServicio * reglas.puntoValor : s.modo === 'fixed' ? s.fijo ?? 0 : Math.floor((s.precio * (s.pct ?? reglas.pct)) / 100))
  const calcular = (clienteId: string, ids: string[], canje: boolean) => {
    const c = clientes.find((x) => x.id === clienteId)!
    const elegido = ids.map((id) => servicios.find((s) => s.id === id)!).filter(Boolean)
    const subtotal = elegido.reduce((a, s) => a + s.precio, 0)
    const maxDescuento = Math.min(c.saldo, Math.floor((subtotal * reglas.tope) / 100))
    const descuento = canje ? maxDescuento : 0
    const toPagar = subtotal - descuento
    const sumar = subtotal === 0 ? 0 : elegido.reduce((a, s) => a + Math.floor((sumarFor(s) * toPagar) / subtotal), 0)
    return { c, elegido, subtotal, maxDescuento, descuento, toPagar, sumar }
  }
  return {
    tipo: 'sample',
    async ingreso(correo) {
      const aurora = correo.includes('aurora')
      const nombre = aurora ? 'Aurora' : 'Rostro Perfecto'
      return demora({ token: 'sample', usuarioNombre: correo.split('@')[0].split('.')[1]?.replace(/^./, (m) => m.toUpperCase()) ?? 'Carolina', localId: 'v1', localNombre: nombre, rol: correo.startsWith('dueno') ? 'DUENIO' : 'INTEGRANTE', marca: { nombre, tono: aurora ? 305 : 350 } } satisfies Sesion)
    },
    async obtenerMarca(s) { return demora(s.marca) },
    async obtenerEmpresa(s) { return demora({ nombre: s.marca.nombre, logoUrl: s.marca.logoUrl }) },
    async guardarEmpresa(_s, c) { return demora(c) },
    async guardarPerfil(_s, p) { return demora(p) },
    async inicio(_s, periodo): Promise<InicioEstadisticas> {
      const v = { HOY: { cantidad: 12, variacionPct: -14, serie: [0, 1, 1, 2, 3, 2, 4, 5, 2] }, SEMANA: { cantidad: 71, variacionPct: 3, serie: [8, 12, 9, 14, 11, 10, 7] }, MES: { cantidad: 312, variacionPct: 8, serie: [38, 52, 44, 60, 36, 70, 82, 48, 56, 64, 40, 74, 90, 66] } }[periodo]
      const vencida = clientes.filter((c) => (c.diasDesde ?? 0) > 30)
      return demora({
        visitas: v, puntosEmitidos: 412600, canjes: { cantidad: 126, descuentos: 168400 },
        top: [{ nombre: 'Manicura semipermanente', cantidad: 148 }, { nombre: 'Esculpidas en gel', cantidad: 96 }, { nombre: 'Pedicuría spa', cantidad: 61 }],
        actividad: [{ id: 'a1', nombre: 'Lucía Benítez', servicios: 'Esculpidas en gel', at: new Date().toISOString(), monto: 22000, acumulado: 1100 }, { id: 'a2', nombre: 'Camila Ríos', servicios: 'Manicura semipermanente', at: new Date().toISOString(), monto: 14000, acumulado: 700 }],
        origenes: [{ origen: 'instagram', cantidad: 18 }, { origen: 'recomendacion', cantidad: 14 }, { origen: 'local', cantidad: 9 }, { origen: 'google', cantidad: 4 }, { origen: 'tiktok', cantidad: 2 }, { origen: null, cantidad: 6 }],
        sinVolver: { cantidad: vencida.length, clientes: vencida.map((c) => ({ id: c.id, nombre: c.nombre, dias: c.diasDesde as number, notified: notified.has(c.id) })) },
      })
    },
    async avisar(_s, id) { notified.add(id); return demora(undefined) },
    async listarClientes(_s, q, filtro, pagina = 0) {
      const t = q.trim().toLowerCase(), d = t.replace(/\D/g, '')
      const todos = clientes.filter((c) => (!t || c.nombre.toLowerCase().includes(t) || (d && c.dni.includes(d))) && (filtro === 'TODAS' || (filtro === 'SIN_VOLVER' ? (c.diasDesde ?? 99) > 60 : c.nivel === { ORO: 'oro', PLATA: 'plata', BASE: 'base' }[filtro]))).map((c) => ({ ...c }))
      return demora({ items: todos.slice(pagina * 30, pagina * 30 + 30), tieneMas: todos.length > (pagina + 1) * 30 })
    },
    async obtenerCliente(_s, id) { const c = clientes.find((x) => x.id === id); if (!c) throw new Error('No encontramos al cliente.'); return demora({ ...c }) },
    async buscarByDni(_s, dni) { return demora(clientes.find((c) => c.dni === dni) ?? null) },
    async identificarByQr() { return demora({ ...clientes[0] }) },
    async guardarCliente(_s, id, entrada) {
      if (id) { const c = clientes.find((x) => x.id === id)!; Object.assign(c, entrada); return demora({ ...c }) }
      const c: Cliente = { id: `c${++sec}`, ...entrada, nivel: 'base', saldo: 0, puntos: 0, diasDesde: null, visitas: 0, desde: new Date().toISOString() }
      clientes.unshift(c)
      return demora({ ...c })
    },
    async quitarCliente(_s, id) { const i = clientes.findIndex((c) => c.id === id); if (i >= 0) clientes.splice(i, 1); return demora(undefined) },
    async clienteMovimientos() {
      return demora([
        { id: 'm1', tipo: 'earn', titulo: 'Esculpidas en gel', fecha: '2025-11-03T15:00:00Z', monto: 1100 },
        { id: 'm2', tipo: 'redeem', titulo: 'Descuento aplicado', fecha: '2025-10-18T15:00:00Z', monto: -2700 },
        { id: 'm3', tipo: 'earn', titulo: 'Manicura semipermanente', fecha: '2025-10-02T15:00:00Z', monto: 700 },
        { id: 'm4', tipo: 'expire', titulo: 'Puntos vencidos', fecha: '2025-09-30T15:00:00Z', monto: -300 },
      ])
    },
    async obtenerTarjetaEnlace() { return demora({ activo: false }) },
    async crearTarjetaEnlace() { return demora({ activo: true, token: 'demo-token', ruta: '/c/demo-token', creadoAt: new Date().toISOString() }) },
    async revocarTarjetaEnlace() { return demora(undefined) },
    async listarServicios() { return demora(servicios.map((s) => ({ ...s, sumar: sumarFor(s), sumarPuntos: reglas.devolucionModo === 'PUNTOS' ? reglas.puntosPorServicio : undefined }))) },
    async guardarServicio(_s, id, entrada) {
      if (id) { const s = servicios.find((x) => x.id === id)!; Object.assign(s, entrada); s.sumar = sumarFor(s); return demora({ ...s }) }
      const s: ServicioElemento = { id: `s${++sec}`, ...entrada, sumar: 0 }
      s.sumar = sumarFor(s)
      servicios.push(s)
      return demora({ ...s })
    },
    async obtenerReglas() { return demora({ ...reglas, premio: { ...reglas.premio } }) },
    async guardarReglas(_s, r) { Object.assign(reglas, r); return demora({ ...reglas }) },
    async subirImagen(_s, archivo) {
      return new Promise<string>((res, rechazado) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = () => rechazado(new Error('No se pudo leer la imagen.')); fr.readAsDataURL(archivo) })
    },
    async vistaPreviaVisita(_s, clienteId, ids, canje): Promise<VisitaVistaPrevia> {
      const r = calcular(clienteId, ids, canje)
      const desbloqueado = reglas.premio.on && (r.c.visitas + 1) % reglas.premio.n === 0
      return demora({ subtotal: r.subtotal, topePct: reglas.tope, maxDescuento: r.maxDescuento, descuento: r.descuento, toPagar: r.toPagar, sumar: r.sumar, premioDesbloqueado: desbloqueado ? servicios.find((s) => s.id === reglas.premio.servicioId)?.nombre : undefined }, 40)
    },
    async registrarVisita(_s, clienteId, ids, canje): Promise<Comprobante> {
      const r = calcular(clienteId, ids, canje)
      const desbloqueado = reglas.premio.on && (r.c.visitas + 1) % reglas.premio.n === 0
      r.c.saldo = r.c.saldo - r.descuento + r.sumar
      r.c.puntos = Math.floor(r.c.saldo / reglas.puntoValor)
      r.c.visitas += 1
      r.c.diasDesde = 0
      return demora({ clienteNombre: r.c.nombre, lineas: r.elegido.map((s) => ({ etiqueta: s.nombre, monto: s.precio })), descuento: r.descuento, toPagar: r.toPagar, ganado: r.sumar, nuevoSaldo: r.c.saldo, premioDesbloqueado: desbloqueado ? servicios.find((s) => s.id === reglas.premio.servicioId)?.nombre : undefined })
    },
  }
}
