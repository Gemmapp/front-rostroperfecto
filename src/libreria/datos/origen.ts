import type { Origen } from './tipos'

export const Origenes: { valor: Origen; etiqueta: string }[] = [
  { valor: 'recomendacion', etiqueta: 'Recomendación' },
  { valor: 'instagram', etiqueta: 'Instagram' },
  { valor: 'facebook', etiqueta: 'Facebook' },
  { valor: 'tiktok', etiqueta: 'TikTok' },
  { valor: 'google', etiqueta: 'Google' },
  { valor: 'local', etiqueta: 'Pasó por el local' },
  { valor: 'otro', etiqueta: 'Otro' },
]
export const origenEtiqueta = (s?: Origen | null) => (s ? Origenes.find((x) => x.valor === s)?.etiqueta ?? 'Otro' : 'Sin dato')

/** Usuario de Instagram sin @ (para armar el enlace al perfil). */
export const instagramUsuario = (v?: string) => v?.trim().replace(/^@/, '') || undefined
export const instagramUrl = (v?: string) => { const u = instagramUsuario(v); return u ? `https://instagram.com/${encodeURIComponent(u)}` : undefined }

/** wa.me exige solo digitos con codigo de pais (8 a 15). El numero ya viene normalizado del servidor. */
export const validoWaTelefono = (p?: string) => !!p && /^[0-9]{8,15}$/.test(p)
export function whatsappUrl(telefono: string, clienteNombre: string, localNombre: string, enlace: string) {
  const texto = `¡Hola ${clienteNombre}! Te paso tu tarjeta de ${localNombre}: ahí ves tu saldo y tus puntos. ${enlace}`
  return `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`
}
