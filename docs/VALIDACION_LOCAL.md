# Validación local del frontend

Fecha: 21 de septiembre de 2026.

## Comprobaciones automáticas

- `npm run build`: correcto.
- `npm run lint`: correcto.
- Swagger se carga en un paquete independiente para no afectar la carga inicial.

## Flujos comprobados con mocks

| Flujo | Resultado |
|---|---|
| Listado, filtros y detalle de vuelos | Correcto |
| Apertura del manifiesto consolidado | Correcto |
| Emisión de boarding pass | Correcto |
| Check-in de ticket emitido | Correcto |
| Listado y cambio de estado de recursos | Correcto |
| Registro de incidencia asociada a recurso y vuelo | Correcto |
| Dashboard con cinco indicadores y gráficos | Correcto |
| Navegación del catálogo OpenAPI MS1–MS5 | Correcto; la carga del contrato depende de cada backend |
| Diseño reducido/móvil | Correcto en las vistas revisadas |

## Pendiente

Repetir los mismos flujos con `VITE_USE_MOCKS=false` cuando MS1–MS5 y API Gateway estén disponibles. Esa prueba es la que debe utilizarse como evidencia final del Hito 2.
