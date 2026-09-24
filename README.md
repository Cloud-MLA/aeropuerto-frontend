# Aeropuerto Frontend

SPA del centro de operaciones del Aeropuerto Internacional Jorge Chávez para el Proyecto Parcial de
Cloud Computing CS2032. Desarrollada con React, Vite y TypeScript.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Ejecución local

```bash
npm install
copy .env.example .env
npm run dev
```

Por defecto la aplicación utiliza datos simulados. Para conectarla a API Gateway:

```env
VITE_API_BASE=https://<api-id>.execute-api.us-east-1.amazonaws.com
VITE_USE_MOCKS=false
```

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # compilación de producción
npm run lint     # análisis estático
npm run preview  # previsualizar la compilación
```

## Módulos implementados

| Ruta | Módulo | Integraciones |
|---|---|---|
| `/` | Consulta de vuelos, detalle, transición de estado y manifiesto | MS2 + MS4 |
| `/tickets` | Emisión de tickets y check-in | MS1 + MS2 |
| `/infraestructura` | Recursos, cambio de estado e incidencias | MS3 |
| `/dashboard` | Dashboard con cinco indicadores operacionales | MS5 + Athena |
| `/docs` | Catálogo Swagger/OpenAPI agregado | MS1–MS5 |

La interfaz incluye estados de carga y vacío, filtros, mensajes para dependencias caídas y diseño adaptable a escritorio, tableta y móvil.

## Configuración

```env
VITE_API_BASE=https://<api-id>.execute-api.us-east-1.amazonaws.com
VITE_USE_MOCKS=false
```

Durante una integración gradual se puede activar solo un subconjunto de APIs reales:

```env
VITE_USE_MOCKS=false
VITE_REAL_SERVICES=ms1,ms2
```

Los demás servicios continuarán con datos simulados. Si `VITE_REAL_SERVICES` está vacío, los cinco servicios se consideran reales.

Las URLs de los contratos OpenAPI se derivan de `VITE_API_BASE`. Se pueden sobrescribir individualmente cuando API Gateway publique otra ruta:

```env
VITE_MS1_OPENAPI_URL=https://<host>/api/pasajeros/openapi.json
VITE_MS2_OPENAPI_URL=https://<host>/api/vuelos/v3/api-docs
VITE_MS3_OPENAPI_URL=https://<host>/api/infra/openapi.json
VITE_MS4_OPENAPI_URL=https://<host>/api/manifiesto/openapi.json
VITE_MS5_OPENAPI_URL=https://<host>/api/analitica/openapi.json
```

## Matriz de cobertura REST

| Vista | Método | Endpoint público esperado | Servicio | Uso |
|---|---|---|---|---|
| Operaciones | GET | `/api/vuelos` | MS2 | Lista y filtra vuelos |
| Operaciones | GET | `/api/vuelos/{id}` | MS2 | Consulta el detalle |
| Operaciones | PATCH | `/api/vuelos/{id}/estado` | MS2 | Ejecuta una transición válida |
| Manifiesto | GET | `/api/manifiesto/{id}` | MS4 | Consolida vuelo, tickets, tripulación e incidencias |
| Manifiesto | GET | `/api/manifiesto/{id}/resumen` | MS4 | Obtiene contadores operacionales |
| Tickets | GET | `/api/pasajeros/categorias-migratorias` | MS1 | Carga categorías y TUUA |
| Tickets | GET | `/api/pasajeros/pasajeros?tipo_documento=&numero_documento=` | MS1 | Localiza un pasajero existente |
| Tickets | POST | `/api/pasajeros/pasajeros` | MS1 | Registra al pasajero cuando no existe |
| Tickets | POST | `/api/pasajeros/tickets` | MS1 | Emite un ticket validando el vuelo |
| Tickets | POST | `/api/pasajeros/tickets/{id}/checkin` | MS1 | Completa el check-in |
| Infraestructura | GET | `/api/infra/recursos` | MS3 | Lista y filtra recursos |
| Infraestructura | PATCH | `/api/infra/recursos/{id}/estado` | MS3 | Actualiza disponibilidad |
| Infraestructura | GET | `/api/infra/incidencias` | MS3 | Lista incidencias |
| Infraestructura | POST | `/api/infra/incidencias` | MS3 | Registra una incidencia |
| Analítica | GET | `/api/analitica/recursos-mas-fallas?dias=7` | MS5 | Indicador Q1 |
| Analítica | GET | `/api/analitica/retraso-promedio?tipo=Internacional` | MS5 | Indicador Q2 |
| Analítica | GET | `/api/analitica/incidencias-combustible-por-aerolinea` | MS5 | Indicador Q3 |
| Analítica | GET | `/api/analitica/recaudacion-tuua-por-categoria` | MS5 | Vista de recaudación |
| Analítica | GET | `/api/analitica/vuelos-hora-punta-retrasados` | MS5 | Vista de retrasos |

> Las rutas reflejan el contrato usado actualmente por el frontend. Antes del despliegue final deben compararse con las rutas publicadas por API Gateway y los OpenAPI definitivos.

## Manejo de fallos

- Tiempo máximo por solicitud: 12 segundos (75 segundos para las consultas Athena de MS5).
- Mensajes específicos para recurso inexistente (`404`), conflicto (`409`), regla de negocio (`422`) y dependencia no disponible (`502–504`).
- Mensaje explícito ante fallos de red, configuración de API Gateway o CORS.
- MS2 respeta la máquina de estados y registra `horaReal` desde el backend al pasar a `Despegado`.
- El frontend adapta el formato publicado por MS4 y MS5. Si MS1 no entrega nombre, asiento o equipaje por ticket, esos campos se muestran como no disponibles; no se infieren datos. El manifiesto también muestra los `warnings` de dependencias caídas.

## Verificación local

```bash
npm test
npm run lint
npm run build
```

Las pruebas de contratos usan respuestas de ejemplo de MS4 y MS5. No sustituyen la prueba final con los servicios desplegados.

## Despliegue en AWS Amplify

- Build command: `npm run build`
- Output directory: `dist`
- Variable `VITE_API_BASE`: URL pública de API Gateway
- Variable `VITE_USE_MOCKS`: `false` para producción

El repositorio incluye `amplify.yml`. En Amplify debe añadirse una regla de reescritura para SPA:

En la consola de Amplify, abre **Hospedaje → Reescrituras y redireccionamientos → Administrar redireccionamientos**. Reemplaza la regla predeterminada `/<*> → /index.html` con estado `404-200` por la regla siguiente con estado `200`; no dejes ambas reglas. Esto permite recargar rutas como `/dashboard/` y `/tickets/` sin recibir HTTP 404.

```text
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target: /index.html
Status: 200 (Rewrite)
```

## Evidencias del Hito 2

La lista de capturas, títulos sugeridos y comprobaciones se encuentra en [`docs/EVIDENCIAS_HITO2.md`](docs/EVIDENCIAS_HITO2.md).

Los bloqueos encontrados durante la integración se registran en [`docs/BLOQUEOS_INTEGRACION.md`](docs/BLOQUEOS_INTEGRACION.md).
