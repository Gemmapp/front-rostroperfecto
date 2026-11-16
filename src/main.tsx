import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BASE } from './libreria/enlaces'
import '@fontsource-variable/bricolage-grotesque/index.css'
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import './estilos/globals.css'
import App from './App'
import { Proveedores } from './componentes/proveedores'

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter basename={BASE || '/'}><Proveedores><App /></Proveedores></BrowserRouter></StrictMode>,
)
