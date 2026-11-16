// Textos con genero: cada persona carga el suyo (Mi perfil). Sin cargar, se usan formas neutras; la interfaz nunca lo adivina.
export type Genero = 'F' | 'M' | 'X' | null | undefined
export type RolClave = 'DUENIO' | 'INTEGRANTE' | 'SOPORTE'

const ROLES: Record<RolClave, Record<'F' | 'M' | 'X', string>> = {
  DUENIO: { F: 'Dueña', M: 'Dueño', X: 'Titular del local' },
  INTEGRANTE: { F: 'Integrante', M: 'Integrante', X: 'Integrante' },
  SOPORTE: { F: 'Soporte del sistema', M: 'Soporte del sistema', X: 'Soporte del sistema' },
}

export const rolEtiqueta = (rol: string, g: Genero): string => ROLES[rol as RolClave]?.[g ?? 'X'] ?? rol

export const bienvenida = (g: Genero): string => (g === 'F' ? 'Bienvenida' : g === 'M' ? 'Bienvenido' : 'Te damos la bienvenida')

export const GeneroOpciones: { valor: 'F' | 'M' | 'X'; etiqueta: string; pista: string }[] = [
  { valor: 'F', etiqueta: 'Femenino', pista: 'Dueña, bienvenida' },
  { valor: 'M', etiqueta: 'Masculino', pista: 'Dueño, bienvenido' },
  { valor: 'X', etiqueta: 'Prefiero no decirlo', pista: 'Textos neutros' },
]
