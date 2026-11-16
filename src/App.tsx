import { Navigate, Route, Routes } from 'react-router-dom'
import GuiaVisual from './paginas/GuiaVisual'
import Ingreso from './paginas/Ingreso'
import PortalCuenta from './paginas/PortalCuenta'
import Reservar from './paginas/Reservar'
import Turno from './paginas/Turno'
import PortalEntrada from './paginas/PortalEntrada'
import TarjetaDemo from './paginas/TarjetaDemo'
import TarjetaPorEnlace from './paginas/TarjetaPorEnlace'
import Clientes from '@/paginas/panel/Clientes'
import Comprobante from './paginas/panel/Comprobante'
import EditarCliente from '@/paginas/panel/EditarCliente'
import EditarServicio from './paginas/panel/EditarServicio'
import Empresa from './paginas/panel/Empresa'
import Perfil from './paginas/panel/Perfil'
import Escanear from './paginas/panel/Escanear'
import Ficha from './paginas/panel/Ficha'
import Inicio from './paginas/panel/Inicio'
import NuevoCliente from '@/paginas/panel/NuevoCliente'
import NuevoServicio from './paginas/panel/NuevoServicio'
import PanelMarco from './paginas/panel/PanelMarco'
import Registrar from './paginas/panel/Registrar'
import Reglas from './paginas/panel/Reglas'
import Servicios from './paginas/panel/Servicios'
import Agenda from './paginas/panel/Agenda'
import AgendaConfig from './paginas/panel/AgendaConfig'
import Bienvenida from './paginas/panel/Bienvenida'
import CambiarClave from './paginas/panel/CambiarClave'
import ConfigInicial from './paginas/panel/ConfigInicial'
import Equipo from './paginas/panel/Equipo'
import Suscripcion from './paginas/panel/Suscripcion'
import Recuperar from './paginas/Recuperar'
import CambiarLocal from './paginas/panel/CambiarLocal'
import Restablecer from './paginas/Restablecer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/panel" replace />} />
      <Route path="/panel/login" element={<Ingreso />} />
      <Route path="/panel/recuperar" element={<Recuperar />} />
      <Route path="/panel/restablecer" element={<Restablecer />} />
      <Route path="/panel" element={<PanelMarco />}>
        <Route index element={<Inicio />} />
        <Route path="escanear" element={<Escanear />} />
        <Route path="registrar" element={<Registrar />} />
        <Route path="comprobante" element={<Comprobante />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/nuevo" element={<NuevoCliente />} />
        <Route path="clientes/:id" element={<Ficha />} />
        <Route path="clientes/:id/editar" element={<EditarCliente />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="servicios/nuevo" element={<NuevoServicio />} />
        <Route path="servicios/:id" element={<EditarServicio />} />
        <Route path="reglas" element={<Reglas />} />
        <Route path="empresa" element={<Empresa />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="suscripcion" element={<Suscripcion />} />
        <Route path="equipo" element={<Equipo />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="agenda/configuracion" element={<AgendaConfig />} />
        <Route path="locales" element={<CambiarLocal />} />
        <Route path="bienvenida" element={<Bienvenida />} />
        <Route path="cambiar-clave" element={<CambiarClave />} />
        <Route path="configurar" element={<ConfigInicial />} />
      </Route>
      <Route path="/c/:token" element={<TarjetaPorEnlace />} />
      <Route path="/reservar/:ref" element={<Reservar />} />
      <Route path="/turno/:token" element={<Turno />} />
      <Route path="/l/:venueId" element={<PortalEntrada />} />
      <Route path="/l/:venueId/cuenta" element={<PortalCuenta />} />
      <Route path="/guia-visual" element={<GuiaVisual />} />
      <Route path="/tarjeta/demo" element={<TarjetaDemo />} />
      <Route path="*" element={<Navigate to="/panel" replace />} />
    </Routes>
  )
}
