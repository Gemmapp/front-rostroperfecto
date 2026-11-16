// Solo formato de presentacion: nunca calcula montos.
const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
export const ars = (n: number) => `${n < 0 ? '−' : ''}$${nf.format(Math.abs(Math.round(n)))}`
export const arsFirmado = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}$${nf.format(Math.abs(Math.round(n)))}`
export const num = (n: number) => nf.format(Math.round(n))
export const dniDigitos = (v: string) => v.replace(/\D/g, '').slice(0, 8)
export const dniFormato = (digitos: string) => digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
export const inicial = (nombre: string) => (nombre.trim()[0] ?? '?').toUpperCase()
export const largoFecha = (iso: string) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
export const cortoFechaHora = (iso: string) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
