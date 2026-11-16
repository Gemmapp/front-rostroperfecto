# front-rostroperfecto

Sitio de fidelización y turnos de **Rostro Perfecto**: el panel para el dueño y el equipo, la tarjeta de puntos del cliente y la página para reservar turnos. Es una aplicación React + Vite que habla con la API del backend `fidelapp`.

## Repositorios del sistema

| Repositorio | Qué es |
|---|---|
| `backend` | API en Go (contrato en `docs/openapi.yaml`) |
| `infra-cdk` | Infraestructura en AWS |
| `front-rostroperfecto` | **este repo**: el sitio del cliente |

Hay un front por cliente: se copia este repo y se cambian `src/libreria/cliente.ts` (nombre y logo), los íconos de `public/` y el título de `index.html`.

## Cómo correrlo

Requisitos: Node 22.

```bash
npm install
cp .env.example .env.local      # ajustar la dirección de la API
npm run dev                     # http://localhost:5173
```

Sin backend se puede ver con datos de ejemplo: `VITE_DATA_SOURCE=sample npm run dev` (entrar con cualquier usuario que empiece con `dueno`, por ejemplo `dueno@demo.test`, y cualquier contraseña).

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | revisa tipos y arma `dist/` (necesita `VITE_API_BASE_URL` o `VITE_DATA_SOURCE=sample`) |
| `npm run build:pages` | lo mismo, más `404.html` para las rutas internas en GitHub Pages |
| `npm run gen:api` | regenera los tipos de la API desde `../backend/docs/openapi.yaml` |

## Variables de entorno

| Variable | Para qué |
|---|---|
| `VITE_API_BASE_URL` | dirección de la API (por ejemplo `https://api.midominio.com`) |
| `VITE_DATA_SOURCE` | `sample` muestra solo datos de ejemplo |
| `VITE_BASE` | subdirectorio del sitio: `/nombre-del-repo/` en GitHub Pages, `/` con dominio propio |
| `VITE_SUPPORT_URL` | enlace o correo de soporte que ve el dueño |

## Publicar en GitHub Pages

1. En el repo: Settings > Pages > Source: **GitHub Actions**.
2. En Settings > Secrets and variables > Actions > **Variables**, cargar `VITE_API_BASE_URL` (o `VITE_DATA_SOURCE=sample` mientras no haya backend). Con dominio propio cargar también `VITE_BASE=/`.
3. Cada cambio en `main` publica solo (workflow `publicar`), o a mano desde Actions.

Nota: GitHub Pages desde un repositorio **privado** requiere un plan de pago (Pro, Team o Enterprise). En el plan gratuito el repositorio tiene que ser público.

Con dominio propio, agregar un archivo `public/CNAME` con el dominio y configurarlo en Settings > Pages.

## Estructura

```
src/
  paginas/        pantallas (panel/ es el panel de administración)
  componentes/    piezas reutilizables (interfaz/ son los controles básicos)
  libreria/       API, datos, sesión, formatos y utilidades
  estilos/        estilos globales (Tailwind)
public/           logo e íconos del cliente
```

El contrato de la API vive en el repo `backend`; `src/libreria/api/esquema.d.ts` se genera de ahí y se sube al repo para que el build no necesite el backend.

## Convenciones

- Todo en español: nombres de archivos, funciones, variables y textos. La "ñ" se escribe "ni" en los nombres (`duenio`, `contrasenia`).
- Los textos para el usuario final usan "clientes" y no suponen el género de nadie.
- Nada de secretos en el repo: la configuración va en variables de entorno.
