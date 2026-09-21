# Bloqueos de integración

Estado observado en las referencias `origin/main` disponibles durante la preparación del frontend.

| Servicio | Bloqueo | Impacto en frontend | Responsable sugerido |
|---|---|---|---|
| MS3 | `recurso.controller.js` importa `validarPatchRecurso`, pero `recurso.schema.js` no lo define ni exporta. | `PATCH /api/infra/recursos/{id}/estado` puede fallar antes de procesar la solicitud. | Responsable de MS3 |
| MS4 | Los endpoints del manifiesto siguen respondiendo `501 Not Implemented`. | FE-06 no puede validar manifiesto y resumen con información real. | Responsable de MS4 |
| MS5 | Los cinco endpoints analíticos siguen respondiendo `501 Not Implemented`. | FE-10 solo puede funcionar con mocks hasta que Athena esté integrado. | Responsable de MS5 / Data Science |
| OpenAPI MS3 | No se encontró una especificación OpenAPI publicada en la referencia disponible. | El selector MS3 de `/docs` no podrá cargar su contrato. | Responsable de MS3 |

## Información necesaria para la validación final

- URL vigente de API Gateway.
- Confirmación de rutas públicas por microservicio.
- CORS habilitado para la URL de Amplify y para el origen local usado en pruebas.
- MS1–MS5 levantados con datos de prueba coherentes.
- Contratos OpenAPI accesibles mediante HTTPS.
