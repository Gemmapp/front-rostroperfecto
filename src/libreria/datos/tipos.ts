// Modelo de vista que consumen las pantallas. La fuente (API real o datos de ejemplo) vive detras de DataSource.
export type Nivel = 'base' | 'plata' | 'oro'
export type Rol = 'DUENIO' | 'INTEGRANTE' | 'SOPORTE'

export interface Marca {
  nombre: string
  logoUrl?: string
  /** hue 0-360 derivado del color de acento del comercio (marca blanca) */
  tono: number
}

export interface LocalAcceso { localId: string; localNombre: string; rol: Rol }

export interface Sesion {
  token: string
  /** locales a los que tiene acceso (mas de uno: el soporte del sistema) */
  locales?: LocalAcceso[]
  /** momento (ms) en que vence el token; el panel lo renueva solo mientras hay actividad */
  tokenVenc?: number
  usuarioNombre: string
  /** nombre completo del usuario (para editar el perfil) */
  usuarioCompletoNombre?: string
  localId: string
  localNombre: string
  rol: Rol
  marca: Marca
  /** foto de perfil del usuario (URL relativa de la API) */
  usuarioFoto?: string
  /** clave provisoria (dada por el administrador): hay que cambiarla antes de usar el panel */
  debeCambiarContrasenia?: boolean
  /** genero que cargo la persona (F, M, X); sin cargar = textos neutros */
  usuarioGenero?: 'F' | 'M' | 'X' | null
}

export interface Contactos { telefono?: string; instagram?: string; direccion?: string }
export interface Empresa {
  nombre: string
  logoUrl?: string
  /** color de marca (hex u oklch) */
  acentoColor?: string
  contactos?: Contactos
}
export interface Perfil { nombre: string; foto?: string }

export interface Sellos { habilitado: boolean; total?: number; hecho?: number; desbloqueadoSiguiente?: boolean; premioNombre?: string }

export interface Cliente {
  id: string
  nombre: string
  dni: string // solo digitos
  telefono?: string // WhatsApp (o contacto)
  cumpleanios?: string // ISO yyyy-mm-dd
  nota?: string
  foto?: string
  nivel: Nivel
  saldo: number
  puntos?: number
  visitas: number
  diasDesde?: number | null
  desde?: string
  siguienteNivel?: { nivel?: Nivel; falta?: number; porcentaje: number }
  sellos?: Sellos
  porVencer?: { monto: number; fecha: string }
  avisoEnviadoAt?: string
  /** como nos conocio */
  origen?: Origen
  /** usuario de Instagram del cliente */
  instagram?: string
  /** WhatsApp normalizado para wa.me (solo digitos con codigo de pais), lo informa el servidor */
  waTelefono?: string
}

export interface ClienteEntrada {
  nombre: string
  dni: string
  telefono?: string
  cumpleanios?: string
  nota?: string
  foto?: string
  origen?: Origen
  instagram?: string
}

export type Origen = 'recomendacion' | 'instagram' | 'facebook' | 'tiktok' | 'google' | 'local' | 'otro'
export type ClienteFiltro = 'TODAS' | 'ORO' | 'PLATA' | 'BASE' | 'SIN_VOLVER'

export interface ServicioElemento {
  id: string
  nombre: string
  precio: number
  modo: 'pct' | 'fixed'
  pct?: number
  fijo?: number
  activo: boolean
  foto?: string
  /** lo que suma por servicio segun el servidor (pesos) */
  sumar: number
  /** lo que suma en puntos segun el servidor (si lo informa) */
  sumarPuntos?: number
  /** duracion del turno en minutos (agenda) */
  duracionMin?: number
  /** personas que lo realizan; vacio = agenda general del local */
  personalIds?: string[]
}
export interface ServicioEntrada {
  nombre: string
  precio: number
  modo: 'pct' | 'fixed'
  pct?: number
  fijo?: number
  activo: boolean
  foto?: string
  duracionMin?: number
  personalIds?: string[]
}

export type DevolucionModo = 'PORCENTAJE' | 'PUNTOS'
export interface Reglas {
  /** como se devuelve al cliente: porcentaje del importe o puntos fijos por servicio */
  devolucionModo: DevolucionModo
  /** puntos por servicio (modo POINTS) */
  puntosPorServicio: number
  pct: number
  puntoValor: number
  /** null = los puntos no vencen */
  meses: number | null
  tope: number
  premio: { on: boolean; n: number; servicioId?: string }
  /** niveles: se conservan al guardar aunque la pantalla no los edite */
  niveles: { plataDesde: number; oroDesde: number; bonusPlataPct: number; bonusOroPct: number }
}

export interface MovimientoElemento {
  id: string
  tipo: 'earn' | 'redeem' | 'expire'
  titulo: string
  fecha: string // ISO
  monto: number
}

export interface VisitaVistaPrevia {
  subtotal: number
  topePct: number
  /** tope de descuento aplicable segun el servidor */
  maxDescuento: number
  descuento: number
  toPagar: number
  sumar: number
  /** puntos que suma segun el servidor */
  sumarPuntos?: number
  premioDesbloqueado?: string
}

export interface ComprobanteLinea { etiqueta: string; monto: number; libre?: boolean }
export interface Comprobante {
  clienteNombre: string
  lineas: ComprobanteLinea[]
  descuento: number
  toPagar: number
  ganado: number
  /** puntos que suma segun el servidor */
  ganadoPuntos?: number
  /** true si el local devuelve por valor de punto (para el formato) */
  puntosModo?: boolean
  nuevoSaldo: number
  premioDesbloqueado?: string
}

export type Periodo = 'HOY' | 'SEMANA' | 'MES'
export interface InicioEstadisticas {
  /** Los empleados solo reciben actividad e inactivas: el resto es null */
  visitas: { cantidad: number; variacionPct?: number | null; serie: number[] } | null
  puntosEmitidos: number | null
  canjes: { cantidad: number; descuentos: number } | null
  top: { nombre: string; cantidad: number }[] | null
  actividad: { id: string; nombre: string; servicios: string; at: string; monto: number; acumulado?: number; revertido?: boolean }[]
  /** De donde llegan los clientes (solo duenos); null/ausente si el servidor no lo informa */
  origenes?: { origen: Origen | null; cantidad: number; nuevoCantidad?: number }[] | null
  sinVolver: { cantidad: number; clientes: { id: string; nombre: string; dias: number; notified: boolean }[] }
}

export interface TarjetaVista {
  clienteNombre: string
  firstNombre: string
  localNombre: string
  /** logo del local (URL de la API); sin logo se muestra la inicial */
  localLogo?: string
  marcaTono: number
  nivel?: Nivel
  nivelBonusPct?: number
  saldo: number
  puntos?: number
  desde?: string
  siguienteNivel?: { nombre?: string; falta?: number; porcentaje: number }
  sellos?: Sellos
  porVencer?: { monto: number; fecha: string }
  movimientos: MovimientoElemento[]
  qrValor: string
}

export interface TarjetaEnlace { activo: boolean; token?: string; ruta?: string; creadoAt?: string; ultimoUsadoAt?: string }

export interface DatosOrigen {
  readonly tipo: 'sample' | 'api'
  ingreso(correo: string, contrasenia: string): Promise<Sesion>
  obtenerMarca(sesion: Sesion): Promise<Marca>
  obtenerEmpresa(sesion: Sesion): Promise<Empresa>
  guardarEmpresa(sesion: Sesion, empresa: Empresa): Promise<Empresa>
  guardarPerfil(sesion: Sesion, perfil: Perfil): Promise<Perfil>
  inicio(sesion: Sesion, periodo: Periodo, sinVolverDias: number): Promise<InicioEstadisticas>
  avisar(sesion: Sesion, clienteId: string): Promise<void>
  listarClientes(sesion: Sesion, q: string, filtro: ClienteFiltro, pagina?: number): Promise<{ items: Cliente[]; tieneMas: boolean }>
  obtenerCliente(sesion: Sesion, id: string): Promise<Cliente>
  buscarByDni(sesion: Sesion, dni: string): Promise<Cliente | null>
  identificarByQr(sesion: Sesion, token: string): Promise<Cliente>
  guardarCliente(sesion: Sesion, id: string | null, entrada: ClienteEntrada): Promise<Cliente>
  quitarCliente(sesion: Sesion, id: string): Promise<void>
  clienteMovimientos(sesion: Sesion, id: string): Promise<MovimientoElemento[]>
  obtenerTarjetaEnlace(sesion: Sesion, id: string): Promise<TarjetaEnlace>
  crearTarjetaEnlace(sesion: Sesion, id: string): Promise<TarjetaEnlace>
  revocarTarjetaEnlace(sesion: Sesion, id: string): Promise<void>
  listarServicios(sesion: Sesion): Promise<ServicioElemento[]>
  guardarServicio(sesion: Sesion, id: string | null, entrada: ServicioEntrada): Promise<ServicioElemento>
  obtenerReglas(sesion: Sesion): Promise<Reglas>
  guardarReglas(sesion: Sesion, reglas: Reglas): Promise<Reglas>
  subirImagen(sesion: Sesion, archivo: File): Promise<string>
  vistaPreviaVisita(sesion: Sesion, clienteId: string, servicioIds: string[], canje: boolean): Promise<VisitaVistaPrevia>
  registrarVisita(sesion: Sesion, clienteId: string, servicioIds: string[], canje: boolean, confirmarDuplicada?: boolean): Promise<Comprobante>
}
