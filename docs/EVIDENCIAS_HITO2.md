# Evidencias del frontend — Hito 2

No tomar las capturas hasta que `VITE_USE_MOCKS=false`, API Gateway responda y los datos mostrados provengan de los microservicios reales.

## Capturas requeridas

1. **Consulta de vuelos integrada con MS2**
   - Mostrar la tabla y el panel de detalle de un vuelo.
   - Incluir DevTools → Network con `GET /api/vuelos` y `GET /api/vuelos/{id}` exitosos.

2. **Actualización del estado de un vuelo mediante MS2**
   - Mostrar una transición válida y el request `PATCH /api/vuelos/{id}/estado`.
   - Si llega a `Despegado`, mostrar `horaReal` generada por el backend.

3. **Manifiesto consolidado mediante MS4**
   - Mostrar pasajeros, check-in, equipaje, tripulación, recursos e incidencias del vuelo.
   - Incluir los dos requests de manifiesto con estado exitoso.

4. **Emisión de ticket y check-in mediante MS1 y MS2**
   - Mostrar el boarding pass emitido y luego el estado “Check-in”.
   - Incluir Network con categorías, vuelos, emisión y check-in.

5. **Gestión de recursos e incidencias mediante MS3**
   - Mostrar un recurso seleccionado, el cambio de estado y una incidencia registrada.

6. **Dashboard analítico conectado a MS5 y Athena**
   - Mostrar las cinco tarjetas y sus gráficos con datos reales.
   - Incluir Network con los cinco endpoints analíticos exitosos.

7. **Catálogo Swagger agregado de MS1–MS5**
   - Mostrar `/docs`, los cinco selectores y una especificación cargada.

8. **Frontend responsive**
   - Mostrar una vista operativa en el modo móvil de DevTools, sin desbordamiento horizontal de la página.

9. **Frontend desplegado en AWS Amplify**
   - Mostrar la URL pública HTTPS y una operación exitosa hacia API Gateway.

## Verificación final

- `npm run build`
- `npm run lint`
- Consola del navegador sin errores inesperados.
- No exponer claves, contraseñas, tokens ni variables privadas en las capturas.
