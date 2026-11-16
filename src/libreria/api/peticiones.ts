import { peticion } from '@/libreria/api/http'
import type * as T from './tipos'

export interface ReservaLocal { id?: string; nombre: string; logoUrl?: string | null; colorAcento?: string | null; telefono?: string | null; direccion?: string | null; instagram?: string | null }
export interface ReservaServicio { id: string; nombre: string; precio: number; duracionMin: number; fotoUrl?: string | null }
export interface ReservaInfo { local: ReservaLocal; servicios: ReservaServicio[]; mensaje?: string | null; maxDiasAnticipacion: number; confirmacionAutomatica: boolean }

const v = (id: string) => `/api/v1/locales/${id}`
const pv = (id: string) => `/api/v1/portal/locales/${id}`

// Capa unica de acceso a la API (contrato: backend/docs/openapi.yaml, tipos generados en schema.d.ts).
export const api = {
  personal: {
    ingreso: (correo: string, contrasenia: string) => peticion<T.PersonalIngresoRespuesta>('POST', '/api/v1/acceso/ingreso', { body: { correo: correo, contrasenia: contrasenia }, alcance: 'none' }),
    forgotContrasenia: (correo: string) => peticion<{ mensaje: string }>('POST', '/api/v1/acceso/olvide-contrasenia', { body: { correo: correo }, alcance: 'none' }),
    resetContrasenia: (token: string, nuevoContrasenia: string) => peticion<void>('POST', '/api/v1/acceso/restablecer-contrasenia', { body: { token, contraseniaNueva: nuevoContrasenia }, alcance: 'none' }),
    refresh: () => peticion<{ tokenAcceso: string; tipoToken: string; expiraEn: number }>('POST', '/api/v1/acceso/renovar'),
    inicio: (localId: string, periodo: 'HOY' | 'SEMANA' | 'MES', sinVolverDias: number) => peticion<T.Inicio>('GET', `${v(localId)}/inicio`, { consulta: { periodo: periodo, diasSinVolver: sinVolverDias } }),
    obtenerMarca: (localId: string) => peticion<T.Marca>('GET', `${v(localId)}/marca`),
    actualizarMarca: (localId: string, body: T.MarcaPeticion) => peticion<T.Marca>('PUT', `${v(localId)}/marca`, { body }),
    actualizarMe: (body: { nombre?: string; fotoUrl?: string | null; genero?: 'F' | 'M' | 'X' | null }) => peticion<T.PersonalPerfil>('PATCH', '/api/v1/acceso/yo', { body }),
    listarServicios: (localId: string) => peticion<T.Servicio[]>('GET', `${v(localId)}/servicios`),
    crearServicio: (localId: string, body: T.ServicioPeticion) => peticion<T.Servicio>('POST', `${v(localId)}/servicios`, { body }),
    actualizarServicio: (localId: string, id: string, body: T.ServicioPeticion) => peticion<T.Servicio>('PUT', `${v(localId)}/servicios/${id}`, { body }),
    obtenerPrograma: (localId: string) => peticion<T.Programa>('GET', `${v(localId)}/programa`),
    actualizarPrograma: (localId: string, body: T.ProgramaPeticion) => peticion<T.Programa>('PUT', `${v(localId)}/programa`, { body }),
    listarClientes: (localId: string, q: string, filtro: string, pagina = 0) => peticion<T.ClientePagina>('GET', `${v(localId)}/clientes`, { consulta: { busqueda: q || undefined, filtro: filtro, pagina: pagina, tamanio: 30 } }),
    obtenerCliente: (localId: string, id: string) => peticion<T.ClienteResumen>('GET', `${v(localId)}/clientes/${id}`),
    obtenerClienteByDni: (localId: string, dni: string) => peticion<T.ClienteResumen>('GET', `${v(localId)}/clientes/por-dni/${encodeURIComponent(dni)}`),
    crearCliente: (localId: string, body: T.ClientePeticion) => peticion<T.ClienteResumen>('POST', `${v(localId)}/clientes`, { body }),
    actualizarCliente: (localId: string, id: string, body: T.ClienteActualizar) => peticion<T.ClienteResumen>('PUT', `${v(localId)}/clientes/${id}`, { body }),
    quitarCliente: (localId: string, id: string) => peticion<void>('DELETE', `${v(localId)}/clientes/${id}`),
    identificarByQr: (localId: string, token: string) => peticion<T.ClienteResumen>('POST', `${v(localId)}/clientes/identificar-qr`, { body: { token } }),
    avisar: (localId: string, id: string) => peticion<unknown>('POST', `${v(localId)}/clientes/${id}/avisos`),
    tarjetaEnlaceEstado: (localId: string, id: string) => peticion<T.TarjetaEnlaceEstado>('GET', `${v(localId)}/clientes/${id}/enlace-tarjeta`),
    crearTarjetaEnlace: (localId: string, id: string) => peticion<T.TarjetaEnlace>('POST', `${v(localId)}/clientes/${id}/enlace-tarjeta`),
    revocarTarjetaEnlace: (localId: string, id: string) => peticion<void>('DELETE', `${v(localId)}/clientes/${id}/enlace-tarjeta`),
    listarMovimientos: (localId: string, id: string) => peticion<T.MovimientoPagina>('GET', `${v(localId)}/clientes/${id}/movimientos`, { consulta: { tamanio: 50 } }),
    reservaConfig: (localId: string) => peticion<T.ReservaConfig>('GET', `${v(localId)}/config-turnos`),
    guardarReservaConfig: (localId: string, body: T.ReservaConfig) => peticion<T.ReservaConfig>('PUT', `${v(localId)}/config-turnos`, { body }),
    appointments: (localId: string, desde: string, to: string) => peticion<T.Turno[]>('GET', `${v(localId)}/turnos`, { consulta: { desde: desde, hasta: to } }),
    crearTurno: (localId: string, body: T.TurnoPeticion) => peticion<T.Turno>('POST', `${v(localId)}/turnos`, { body }),
    fijarTurnoEstado: (localId: string, id: string, estado: 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO' | 'NO_ASISTIO') => peticion<T.Turno>('POST', `${v(localId)}/turnos/${id}/estado`, { body: { estado: estado } }),
    moverTurno: (localId: string, id: string, inicio: string) => peticion<T.Turno>('POST', `${v(localId)}/turnos/${id}/mover`, { body: { inicio: inicio } }),
    cambiarContrasenia: (actualContrasenia: string, nuevoContrasenia: string) => peticion<void>('POST', '/api/v1/acceso/cambiar-contrasenia', { body: { contraseniaActual: actualContrasenia, contraseniaNueva: nuevoContrasenia } }),
    me: () => peticion<T.PersonalPerfil>('GET', '/api/v1/acceso/yo'),
    listarPersonal: (localId: string) => peticion<T.PersonalMiembro[]>('GET', `${v(localId)}/personal`),
    agregarPersonal: (localId: string, body: T.PersonalPeticion) => peticion<T.PersonalMiembro>('POST', `${v(localId)}/personal`, { body }),
    quitarPersonal: (localId: string, usuarioId: string) => peticion<void>('DELETE', `${v(localId)}/personal/${usuarioId}`),
    guia: (localId: string) => peticion<T.Guia>('GET', `${v(localId)}/guia`),
    dismissGuia: (localId: string) => peticion<void>('POST', `${v(localId)}/guia/descartar`),
    suscripcion: (localId: string) => peticion<T.Suscripcion>('GET', `${v(localId)}/suscripcion`),
    suscripcionPayments: (localId: string, pagina = 0) =>
      peticion<{ contenido: T.SuscripcionPago[]; pagina: number; tamanio: number; totalElementos: number; totalPaginas: number }>('GET', `${v(localId)}/suscripcion/pagos`, { consulta: { pagina: pagina, tamanio: 20 } }),
    subir: (localId: string, archivo: File) => { const fd = new FormData(); fd.append('file', archivo); return peticion<{ url: string }>('POST', `${v(localId)}/subidas`, { body: fd }) },
    vistaPreviaVisita: (localId: string, clienteId: string, servicioIds: string[], canjeMonto: number) =>
      peticion<T.VisitaVistaPrevia>('GET', `${v(localId)}/visitas/vista-previa`, { consulta: { clienteId: clienteId, servicioIds: servicioIds, montoCanje: canjeMonto } }),
    crearVisita: (localId: string, body: { clienteId: string; servicioIds: string[]; montoCanje: number; confirmarDuplicada: boolean }) =>
      peticion<T.Visita>('POST', `${v(localId)}/visitas`, { body }),
  },
  reserva: {
    info: (ref: string) => peticion<ReservaInfo>('GET', `/api/v1/publico/reservas/${encodeURIComponent(ref)}`, { alcance: 'none' }),
    availability: (ref: string, servicioId: string, fecha: string) => peticion<{ fecha: string; horas: string[]; duracionMin: number }>('GET', `/api/v1/publico/reservas/${encodeURIComponent(ref)}/disponibilidad`, { alcance: 'none', consulta: { servicioId: servicioId, fecha: fecha } }),
    reservar: (ref: string, body: T.TurnoPeticion) => peticion<{ turno: T.Turno; tokenGestion: string; rutaGestion: string; nombreLocal: string }>('POST', `/api/v1/publico/reservas/${encodeURIComponent(ref)}/turnos`, { alcance: 'none', body }),
    turno: (token: string) => peticion<{ turno: T.Turno; local: ReservaLocal }>('GET', `/api/v1/publico/turnos/${encodeURIComponent(token)}`, { alcance: 'none' }),
    cancelar: (token: string) => peticion<{ turno: T.Turno }>('POST', `/api/v1/publico/turnos/${encodeURIComponent(token)}/cancelar`, { alcance: 'none' }),
  },
  portal: {
    local: (localId: string) => peticion<T.PortalLocal>('GET', pv(localId), { alcance: 'none' }),
    ingreso: (localId: string, dni: string, pin: string) => peticion<T.ClienteIngresoRespuesta>('POST', `${pv(localId)}/ingreso`, { body: { dni, pin }, alcance: 'none' }),
    registrar: (localId: string, body: { dni: string; nombre: string; contacto: string; pin: string }) =>
      peticion<T.ClienteIngresoRespuesta>('POST', `${pv(localId)}/registro`, { body, alcance: 'none' }),
    tarjeta: (localId: string) => peticion<T.TarjetaVista>('GET', `${pv(localId)}/yo`, { alcance: 'customer' }),
    qrToken: () => peticion<T.QrToken>('GET', '/api/v1/portal/token-qr', { alcance: 'customer' }),
  },
  publicTarjeta: {
    obtener: (token: string) => peticion<T.TarjetaVista>('GET', `/api/v1/publico/tarjeta/${encodeURIComponent(token)}`, { alcance: 'none' }),
    qr: (token: string) => peticion<T.QrToken>('GET', `/api/v1/publico/tarjeta/${encodeURIComponent(token)}/qr`, { alcance: 'none' }),
  },
}
