// Fechas de la agenda: texto AAAA-MM-DD en la zona del navegador (el local y sus clientes estan en la misma zona).
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const desdeISO = (s: string) => new Date(`${s}T12:00:00`)
export const agregarDias = (s: string, n: number) => { const d = desdeISO(s); d.setDate(d.getDate() + n); return iso(d) }
export const hoyISO = () => iso(new Date())
export const diaCorto = (s: string) => desdeISO(s).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }).replace('.', '')
export const diaLargo = (s: string) => { const t = desdeISO(s).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }); return t.charAt(0).toUpperCase() + t.slice(1) }
export const horaOf = (localInicio: string) => localInicio.slice(11, 16)
export const finHora = (localInicio: string, duracionMin: number) => {
  const [h, m] = horaOf(localInicio).split(':').map(Number)
  const t = h * 60 + m + duracionMin
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
