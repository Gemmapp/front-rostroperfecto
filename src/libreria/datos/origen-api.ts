// Fuente REAL: todo sale de la API (contrato v2 en backend/docs/openapi.yaml).
import { api } from '@/libreria/api/peticiones'
import { ApiError, recursoUrl } from '@/libreria/api/http'
import type * as T from '@/libreria/api/tipos'
import { tonoDesdeColor } from '@/libreria/marca'
import type { Cliente, ClienteFiltro, Empresa, Origen, InicioEstadisticas, DatosOrigen, Nivel, MovimientoElemento, Comprobante, Rol, Reglas, ServicioEntrada, ServicioElemento, Sesion, Sellos } from './tipos'

const Nivel: Record<T.Nivel, Nivel> = { BASE: 'base', PLATA: 'plata', ORO: 'oro' }
const sellos = (s?: T.Sellos): Sellos | undefined => (s ? { habilitado: s.habilitado, total: s.total ?? undefined, hecho: s.cumplidos ?? undefined, desbloqueadoSiguiente: s.proximaDesbloquea, premioNombre: s.nombrePremio ?? undefined } : undefined)

const Origen: Record<string, Origen> = { REFERRAL: 'recomendacion', INSTAGRAM: 'instagram', FACEBOOK: 'facebook', TIKTOK: 'tiktok', GOOGLE: 'google', PASSING: 'local', OTHER: 'otro' }
const OrigenSalida: Record<Origen, T.ClientePeticion['origen']> = { recomendacion: 'RECOMENDACION', instagram: 'INSTAGRAM', facebook: 'FACEBOOK', tiktok: 'TIKTOK', google: 'GOOGLE', local: 'PASO_POR_EL_LOCAL', otro: 'OTRO' }
const toOrigen = (s?: string | null): Origen | undefined => (s ? Origen[s] : undefined)
const toCliente = (c: T.ClienteResumen): Cliente => ({
  origen: toOrigen(c.origen), instagram: c.instagram ?? undefined, waTelefono: c.telefonoWhatsapp ?? undefined,
  id: c.id, nombre: c.nombre, dni: c.dni, telefono: c.whatsapp ?? (c.contacto || undefined), cumpleanios: c.cumpleanios ?? undefined, nota: c.nota ?? undefined,
  foto: c.fotoUrl ?? undefined, nivel: Nivel[c.nivel], saldo: c.saldo, puntos: c.puntos, visitas: c.visitas, diasDesde: c.diasDesdeUltimaVisita, desde: c.altaEn,
  siguienteNivel: { nivel: c.proximoNivel.nivel ? Nivel[c.proximoNivel.nivel] : undefined, falta: c.proximoNivel.falta ?? undefined, porcentaje: c.proximoNivel.avancePct },
  sellos: sellos(c.sellos), porVencer: c.porVencer ? { monto: c.porVencer.monto, fecha: c.porVencer.venceEl } : undefined, avisoEnviadoAt: c.avisadoEn ?? undefined,
})
const toServicio = (s: T.Servicio): ServicioElemento => ({
  id: s.id, nombre: s.nombre, precio: s.precio, activo: s.activo, sumar: s.devolucionEfectiva, sumarPuntos: s.puntosDevolucionEfectiva, foto: s.fotoUrl ?? undefined, duracionMin: s.duracionMin ?? 60, personalIds: s.personalIds ?? [],
  modo: s.reglaAcumulacion?.tipo === 'FIJO' ? 'fixed' : 'pct',
  pct: s.reglaAcumulacion?.tipo === 'PORCENTAJE' ? s.reglaAcumulacion.valor : undefined,
  fijo: s.reglaAcumulacion?.tipo === 'FIJO' ? s.reglaAcumulacion.valor : undefined,
})
const toPeticion = (i: ServicioEntrada): T.ServicioPeticion => ({
  nombre: i.nombre, precio: Math.round(i.precio), activo: i.activo, fotoUrl: i.foto ?? null, duracionMin: i.duracionMin, personalIds: i.personalIds,
  reglaAcumulacion: i.modo === 'fixed' ? { tipo: 'FIJO', valor: i.fijo ?? 0 } : i.pct != null ? { tipo: 'PORCENTAJE', valor: i.pct } : null,
})
const toReglas = (p: T.Programa): Reglas => ({
  devolucionModo: p.modoDevolucion, puntosPorServicio: p.puntosPorServicio ?? 10,
  pct: p.devolucionBasePct, puntoValor: p.valorPunto, meses: p.mesesVencimiento ?? null, tope: p.topeCanjePct, niveles: p.niveles,
  premio: { on: p.premioPorVisitas.habilitado, n: p.premioPorVisitas.cadaN, servicioId: p.premioPorVisitas.servicioId ?? undefined },
})
const toEmpresa = (b: T.Marca): Empresa => ({ nombre: b.nombre, logoUrl: b.logoUrl ?? undefined, acentoColor: b.colorAcento ?? undefined, contactos: { telefono: b.telefono ?? undefined, direccion: b.direccion ?? undefined, instagram: b.instagram ?? undefined } })
const tipo = (t: T.Movimiento['tipo']): MovimientoElemento['tipo'] => (t === 'CANJE' ? 'redeem' : t === 'VENCIMIENTO' ? 'expire' : 'earn')

export function crearApiOrigen(): DatosOrigen {
  const idLocal = (s: Sesion) => s.localId
  return {
    tipo: 'api',
    async ingreso(correo, contrasenia) {
      const r = await api.personal.ingreso(correo, contrasenia)
      const locales = r.usuario.membresias.map((x) => ({ localId: x.localId, localNombre: x.nombreLocal, rol: x.rol as Rol }))
      const m = locales.find((x) => x.rol !== 'SOPORTE') ?? locales[0] // el soporte arranca en su propio local si tiene, o elige uno
      if (!m) throw new ApiError(403, { titulo: 'Sin local asignado', detalle: 'Tu usuario no tiene un local asignado.' })
      return { token: r.tokenAcceso, locales: locales.length > 1 ? locales : undefined, tokenVenc: Date.now() + r.expiraEn * 1000, usuarioNombre: r.usuario.nombre.split(' ')[0], usuarioCompletoNombre: r.usuario.nombre, localId: m.localId, localNombre: m.localNombre, rol: m.rol, marca: { nombre: m.localNombre, tono: 350 }, usuarioFoto: r.usuario.fotoUrl ?? undefined, debeCambiarContrasenia: r.usuario.debeCambiarContrasenia === true, usuarioGenero: r.usuario.genero ?? null }
    },
    async obtenerMarca(s) {
      const b = await api.personal.obtenerMarca(idLocal(s))
      return { nombre: b.nombre, logoUrl: recursoUrl(b.logoUrl), tono: tonoDesdeColor(b.colorAcento) }
    },
    async obtenerEmpresa(s) { return toEmpresa(await api.personal.obtenerMarca(idLocal(s))) },
    // PUT /brand es REEMPLAZO COMPLETO (salvo name): se envian siempre todos los valores del formulario.
    async guardarEmpresa(s, c) {
      const k = c.contactos ?? {}
      return toEmpresa(await api.personal.actualizarMarca(idLocal(s), { nombre: c.nombre, logoUrl: c.logoUrl ?? null, colorAcento: c.acentoColor ?? null, telefono: k.telefono?.trim() || null, direccion: k.direccion?.trim() || null, instagram: k.instagram?.trim() || null }))
    },
    async guardarPerfil(_s, p) {
      const u = await api.personal.actualizarMe({ nombre: p.nombre, fotoUrl: p.foto ?? null })
      return { nombre: u.nombre, foto: u.fotoUrl ?? undefined }
    },
    async inicio(s, periodo, sinVolverDias): Promise<InicioEstadisticas> {
      const d = await api.personal.inicio(idLocal(s), periodo, sinVolverDias)
      return {
        visitas: d.visitas ? { cantidad: d.visitas.cantidad, variacionPct: d.visitas.variacionPct, serie: d.visitas.serie.map((p) => p.visitas) } : null,
        puntosEmitidos: d.puntosEmitidos?.monto ?? null,
        canjes: d.canjes ? { cantidad: d.canjes.cantidad ?? 0, descuentos: d.canjes.montoDescuentos ?? 0 } : null,
        top: d.serviciosTop ? d.serviciosTop.map((t) => ({ nombre: t.nombre, cantidad: t.cantidad })) : null,
        actividad: d.actividadHoy.map((a) => ({ id: a.visitaId, nombre: a.cliente.nombre, servicios: a.servicios.join(', '), at: a.at, monto: a.monto, acumulado: a.acumulado, revertido: a.estado === 'REVERTIDA' })),
        origenes: d.origenes ? d.origenes.map((x) => ({ origen: x.origen === 'SIN_DATO' ? null : toOrigen(x.origen) ?? 'otro', cantidad: x.clientes, nuevoCantidad: x.clientesNuevos })) : null,
        sinVolver: { cantidad: d.sinVolver.cantidad, clientes: d.sinVolver.clientes.map((c) => ({ id: c.cliente.id, nombre: c.cliente.nombre, dias: c.diasDesdeUltimaVisita, notified: c.avisada })) },
      }
    },
    async avisar(s, id) { await api.personal.avisar(idLocal(s), id) },
    async listarClientes(s, q, filtro: ClienteFiltro, pagina = 0) {
      const r = await api.personal.listarClientes(idLocal(s), q.trim(), filtro, pagina)
      return { items: r.contenido.map(toCliente), tieneMas: r.pagina + 1 < r.totalPaginas }
    },
    async obtenerCliente(s, id) { return toCliente(await api.personal.obtenerCliente(idLocal(s), id)) },
    async buscarByDni(s, dni) {
      try { return toCliente(await api.personal.obtenerClienteByDni(idLocal(s), dni)) }
      catch (e) { if (e instanceof ApiError && e.problema.codigo === 'CLIENTE_NO_EN_LOCAL') return null; throw e }
    },
    async identificarByQr(s, token) { return toCliente(await api.personal.identificarByQr(idLocal(s), token)) },
    async guardarCliente(s, id, i) {
      // PUT es reemplazo de los datos editables: se envian siempre los valores actuales (source e instagram incluidos).
      const extra = { whatsapp: i.telefono ?? null, cumpleanios: i.cumpleanios || null, nota: i.nota ?? null, fotoUrl: i.foto ?? null, origen: i.origen ? OrigenSalida[i.origen] : null, instagram: i.instagram ?? null }
      if (id) return toCliente(await api.personal.actualizarCliente(idLocal(s), id, { nombre: i.nombre, ...extra }))
      return toCliente(await api.personal.crearCliente(idLocal(s), { dni: i.dni, nombre: i.nombre, contacto: i.telefono || i.nombre, ...extra }))
    },
    async quitarCliente(s, id) { await api.personal.quitarCliente(idLocal(s), id) },
    async clienteMovimientos(s, id) {
      const p = await api.personal.listarMovimientos(idLocal(s), id)
      return p.contenido.map((m) => ({ id: m.id, tipo: tipo(m.tipo), titulo: m.motivo, fecha: m.creadoEn, monto: m.monto }))
    },
    async obtenerTarjetaEnlace(s, id) { const r = await api.personal.tarjetaEnlaceEstado(idLocal(s), id); return { activo: r.activo, creadoAt: r.creadoEn ?? undefined, ultimoUsadoAt: r.ultimoUsoEn ?? undefined } },
    async crearTarjetaEnlace(s, id) { const r = await api.personal.crearTarjetaEnlace(idLocal(s), id); return { activo: true, token: r.token, ruta: r.ruta, creadoAt: r.creadoEn } },
    async revocarTarjetaEnlace(s, id) { await api.personal.revocarTarjetaEnlace(idLocal(s), id) },
    async listarServicios(s) { return (await api.personal.listarServicios(idLocal(s))).map(toServicio) },
    async guardarServicio(s, id, entrada) {
      const body = toPeticion(entrada)
      return toServicio(id ? await api.personal.actualizarServicio(idLocal(s), id, body) : await api.personal.crearServicio(idLocal(s), body))
    },
    async obtenerReglas(s) { return toReglas(await api.personal.obtenerPrograma(idLocal(s))) },
    async guardarReglas(s, r) {
      return toReglas(await api.personal.actualizarPrograma(idLocal(s), {
        modoDevolucion: r.devolucionModo, puntosPorServicio: r.puntosPorServicio,
        devolucionBasePct: r.pct, valorPunto: r.puntoValor, mesesVencimiento: r.meses, topeCanjePct: r.tope, niveles: r.niveles,
        premioPorVisitas: { habilitado: r.premio.on, cadaN: r.premio.n, servicioId: r.premio.servicioId ?? null },
      }))
    },
    async subirImagen(s, archivo) { return (await api.personal.subir(idLocal(s), archivo)).url },
    // El servidor calcula total, tope de canje, a cobrar y acumulacion; la UI solo lo muestra.
    async vistaPreviaVisita(s, clienteId, ids, canje) {
      let p = await api.personal.vistaPreviaVisita(idLocal(s), clienteId, ids, 0)
      if (canje && p.maxCanjeable > 0) p = await api.personal.vistaPreviaVisita(idLocal(s), clienteId, ids, p.maxCanjeable)
      return { subtotal: p.monto, topePct: p.topeCanjePct, maxDescuento: p.maxCanjeable, descuento: p.montoCanje, toPagar: p.aPagar, sumar: p.acumulacionEstimada, sumarPuntos: p.puntosEstimados, premioDesbloqueado: p.premioDesbloqueado ? p.premioPorVisitas?.nombreServicio : undefined }
    },
    async registrarVisita(s, clienteId, ids, canje, confirmarDuplicada = false): Promise<Comprobante> {
      const p = canje ? await api.personal.vistaPreviaVisita(idLocal(s), clienteId, ids, 0) : null
      const v = await api.personal.crearVisita(idLocal(s), { clienteId: clienteId, servicioIds: ids, montoCanje: p ? p.maxCanjeable : 0, confirmarDuplicada: confirmarDuplicada })
      return {
        clienteNombre: v.cliente.nombre,
        lineas: v.lineas.map((l) => ({ etiqueta: l.nombre, monto: l.precio, libre: l.premio })),
        descuento: v.canjeado, toPagar: v.pagado, ganado: v.acumulado, ganadoPuntos: v.puntosAcumulados, nuevoSaldo: v.saldoPosterior ?? 0, premioDesbloqueado: v.premioPorVisitas?.nombreServicio,
      }
    },
  }
}
