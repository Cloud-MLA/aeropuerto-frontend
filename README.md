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

## Módulos previstos

- Consulta de vuelo y manifiesto (MS2 + MS4)
- Emisión de tickets y check-in (MS1 + MS2)
- Recursos e incidencias (MS3)
- Dashboard analítico (MS5/Athena)
- Catálogo Swagger agregado (MS1–MS5)

## Despliegue en AWS Amplify

- Build command: `npm run build`
- Output directory: `dist`
- Variable `VITE_API_BASE`: URL pública de API Gateway
- Variable `VITE_USE_MOCKS`: `false` para producción

El repositorio incluye `amplify.yml`. En Amplify debe añadirse una regla de reescritura para SPA:

```text
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target: /index.html
Status: 200 (Rewrite)
```
