// Cliente HTTP minimo: base configurable, token Bearer y errores RFC 9457 (problem+json).
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8082' : '')

/** Imagenes subidas: la API devuelve rutas relativas (/archivos/<uuid>). */
export const recursoUrl = (u?: string | null): string | undefined => (u ? (u.startsWith('/') ? `${API_BASE_URL}${u}` : u) : undefined)

export interface ProblemaDetalles {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  codigo?: string
  errores?: { campo: string; mensaje: string }[]
  [k: string]: unknown
}

export class ApiError extends Error {
  readonly estado: number
  readonly problema: ProblemaDetalles
  constructor(estado: number, problema: ProblemaDetalles) {
    super(problema.detail ?? problema.title ?? `Error ${estado}`)
    this.estado = estado
    this.problema = problema
  }
  /** Mensaje apto para mostrar al usuario (en espanol). */
  get userMessage(): string {
    if (this.estado === 0) return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
    if (this.estado === 401) return 'Los datos no son correctos o la sesión venció.'
    if (this.estado === 403) return 'No tenés permiso para hacer esto.'
    if (this.estado === 402) return this.problema.detail ?? 'Tu plan no permite esto. Revisá tu suscripción.'
    if (this.estado === 429) return 'Demasiados intentos. Esperá unos minutos antes de volver a probar.'
    if (this.estado === 501) return this.problema.detail ?? 'Todavía no está disponible.'
    if (this.estado >= 500) return 'Algo falló de nuestro lado. Probá de nuevo en un momento.'
    return this.problema.detail ?? this.problema.title ?? 'No se pudo completar la operación.'
  }
}

type TokenObtener = () => string | null
let personalToken: TokenObtener = () => null
let clienteToken: TokenObtener = () => null
let onNoAutorizado: (alcance: 'staff' | 'customer') => void = () => {}

export function configurarHttp(opciones: { personalToken?: TokenObtener; clienteToken?: TokenObtener; onNoAutorizado?: typeof onNoAutorizado }) {
  if (opciones.personalToken) personalToken = opciones.personalToken
  if (opciones.clienteToken) clienteToken = opciones.clienteToken
  if (opciones.onNoAutorizado) onNoAutorizado = opciones.onNoAutorizado
}

export async function peticion<T>(metodo: string, ruta: string, opciones: { body?: unknown; alcance?: 'staff' | 'customer' | 'none'; consulta?: Record<string, string | number | string[] | undefined> } = {}): Promise<T> {
  const alcance = opciones.alcance ?? 'staff'
  const url = new URL(ruta, API_BASE_URL)
  for (const [k, v] of Object.entries(opciones.consulta ?? {})) {
    if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x))
    else if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  }
  const cabeceras: Record<string, string> = { Accept: 'application/json' }
  const isFormulario = typeof FormData !== 'undefined' && opciones.body instanceof FormData
  if (opciones.body !== undefined && !isFormulario) cabeceras['Content-Type'] = 'application/json'
  const token = alcance === 'staff' ? personalToken() : alcance === 'customer' ? clienteToken() : null
  if (token) cabeceras.Authorization = `Bearer ${token}`
  let res: Response
  try {
    res = await fetch(url, { method: metodo, headers: cabeceras, body: opciones.body === undefined ? undefined : isFormulario ? (opciones.body as FormData) : JSON.stringify(opciones.body) })
  } catch {
    throw new ApiError(0, { title: 'Sin conexión' })
  }
  if (res.status === 204) return undefined as T
  const texto = await res.text()
  const datos = texto ? seguroJson(texto) : undefined
  if (!res.ok) {
    if (res.status === 401 && alcance !== 'none' && token) onNoAutorizado(alcance)
    throw new ApiError(res.status, (datos as ProblemaDetalles) ?? { titulo: res.statusText })
  }
  return datos as T
}

function seguroJson(t: string): unknown {
  try { return JSON.parse(t) } catch { return undefined }
}
