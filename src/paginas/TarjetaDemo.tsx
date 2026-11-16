import { ClienteTarjetaPantalla } from '@/componentes/tarjeta-cliente'
import { EjemploEtiqueta } from '@/componentes/interfaz/visualizacion'
import type { TarjetaVista } from '@/libreria/datos/tipos'

// Ejemplo estatico de la tarjeta (sin backend), solo para revisar el diseno. La ruta real es /c/[token].
const Vista: TarjetaVista = {
  clienteNombre: 'Sofía Aguirre', firstNombre: 'Sofía', localNombre: 'Rostro Perfecto', marcaTono: 350, nivel: 'plata', nivelBonusPct: 10, saldo: 8450, puntos: 845, desde: '2025-03-10',
  siguienteNivel: { nombre: 'Oro', falta: 3550, porcentaje: 70 },
  sellos: { habilitado: true, total: 5, hecho: 3, premioNombre: 'Manicura semipermanente' },
  porVencer: { monto: 1200, fecha: '2025-11-30' },
  qrValor: 'rewards-demo-sofia-aguirre',
  movimientos: [
    { id: '1', tipo: 'earn', titulo: 'Esculpidas en gel', fecha: '2025-11-03T15:00:00Z', monto: 1100 },
    { id: '2', tipo: 'redeem', titulo: 'Descuento aplicado', fecha: '2025-10-18T15:00:00Z', monto: -2700 },
    { id: '3', tipo: 'earn', titulo: 'Manicura semipermanente', fecha: '2025-10-02T15:00:00Z', monto: 700 },
    { id: '4', tipo: 'expire', titulo: 'Puntos vencidos', fecha: '2025-09-30T15:00:00Z', monto: -300 },
  ],
}

export default function TarjetaDemo() {
  return (
    <>
      <div className="mx-auto flex max-w-[420px] justify-center bg-background pt-3"><EjemploEtiqueta /></div>
      <ClienteTarjetaPantalla vista={Vista} />
    </>
  )
}
