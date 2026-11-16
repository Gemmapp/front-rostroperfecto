// Direcciones del sitio. Con GitHub Pages el sitio vive en un subdirectorio (por ejemplo /front-rostroperfecto/):
// BASE_URL lo trae Vite (en un dominio propio es "/").
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Direccion completa de una ruta de la aplicacion, para compartir o copiar (tarjeta, reservas). */
export const urlPublica = (ruta: string): string => `${window.location.origin}${BASE}${ruta}`

/** Direccion de un archivo de la carpeta public (logo, iconos). */
export const recurso = (nombre: string): string => `${import.meta.env.BASE_URL}${nombre}`
