# product-requests-service

Microservicio NestJS responsable de la gestión del ciclo de vida de las solicitudes de productos bancarios. Implementa Clean Architecture.

## Responsabilidades

- Crear solicitudes de producto asociadas a un cliente
- Consultar solicitudes por número de documento del cliente
- Consultar el detalle de una solicitud por ID
- Actualizar el estado de una solicitud siguiendo la máquina de estados definida en dominio
- Eliminar una solicitud

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/product-requests` | Crea una nueva solicitud |
| `GET` | `/product-requests?clientDocNumber=` | Lista solicitudes de un cliente |
| `GET` | `/product-requests/:id` | Obtiene el detalle de una solicitud |
| `PATCH` | `/product-requests/:id/status` | Actualiza el estado de una solicitud |
| `DELETE` | `/product-requests/:id` | Elimina una solicitud |

## Decisiones de diseño

### Consulta siempre filtrada por cliente (YAGNI)
No existe un endpoint ni método de repositorio `findAll()` sin filtro. Todas las consultas de listado deben ir acompañadas del `clientDocNumber`. Esto obedece a dos razones:
- **Seguridad**: evita exponer solicitudes de otros clientes.
- **Performance**: evita escaneos completos de colección en MongoDB.

Si en el futuro se requiere un listado administrativo sin filtro (ej. backoffice), el diseño es completamente escalable: basta con agregar `findAll()` en `ProductRequestRepository` e implementarlo en `MongooseProductRequestRepository`.

### Autenticación delegada al API Gateway
Este microservicio no valida tokens JWT. La autenticación y autorización son responsabilidad del API Gateway, que verifica el token antes de reenviar la solicitud. El `clientDocNumber` debería ser inyectado por el gateway desde el payload del JWT como header `X-Client-Doc-Number`, para evitar que el cliente manipule el query param.

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `PORT` | Puerto del servicio | No (default: 3002) |
| `MONGODB_URI` | URI de conexión a MongoDB | Sí |
| `JWT_SECRET` | Secreto para verificar tokens | Sí |

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev

# Build producción
npm run build

# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

