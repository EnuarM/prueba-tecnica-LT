# authentication-service

Microservicio de autenticación de la plataforma bancaria. Actúa como proxy entre el cliente y el core bancario (Mulesoft), validando credenciales y emitiendo tokens de acceso.

## Responsabilidad

Recibe las credenciales del usuario, las valida contra el core bancario a través de Mulesoft, y retorna un JWT firmado que contiene la información del usuario. No gestiona sesiones ni almacena estado.

## Arquitectura

El servicio sigue **Clean Architecture** con separación estricta de capas:

```
src/
├── domain/
│   └── exceptions/          # InvalidCredentialsException
├── application/
│   ├── ports/               # CoreBankingAuthPort, TokenGenerator (contratos)
│   ├── use-cases/           # LoginUseCase (lógica de negocio)
│   └── dtos/                # LoginRequestDto, LoginResponseDto
├── infrastructure/
│   ├── mulesoft/            # MulesoftAuthAdapter (implementa CoreBankingAuthPort)
│   └── auth/                # JwtTokenGenerator (implementa TokenGenerator)
└── presentation/
    ├── controllers/         # AuthController
    └── filters/             # DomainExceptionFilter
```

Las dependencias siempre apuntan hacia adentro: infraestructura depende de aplicación, aplicación depende de dominio. Los puertos (interfaces abstractas) desacoplan las capas externas de la lógica de negocio.

## Endpoint

### `POST /auth/login`

**Request:**
```json
{
  "docNumber": "12345678",
  "password": "secret"
}
```

**Response `200 OK`:**
```json
{
  "accessToken": "<JWT>"
}
```

El JWT contiene en su payload la información completa retornada por Mulesoft:
```json
{
  "govIssueIdent": {
    "govIssueIdentType": "CC",
    "identSerialNum": "12345678"
  },
  "personName": {
    "fullName": "John Doe",
    "lastAuthInfo": { "lastTrnDt": "2024-01-01T00:00:00" }
  }
}
```

**Response `401 Unauthorized`** (credenciales inválidas):
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid document number or password"
}
```

## Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `PORT` | Puerto del servidor | No (default 3000) |
| `NODE_ENV` | Entorno (`development` / `production`) | No |
| `JWT_SECRET` | Clave de firma del JWT (mín. 32 caracteres) | Sí |
| `JWT_EXPIRES_IN` | Duración del token (ej. `1h`, `7d`) | Sí |
| `MULESOFT_BASE_URL` | URL base del mock de Mulesoft | Sí |

## Ejecución local

```bash
# Instalar dependencias
npm install

# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run start:prod
```

## Ejecución con Docker

```bash
# Desde la raíz del monorepo
docker compose up authentication-service
```

## Tests

```bash
# Unitarios
npm run test

# Unitarios con cobertura
npm run test:cov

# Watch mode
npm run test:watch
```

Los tests cubren todas las capas: dominio, casos de uso, filtros, adaptadores de infraestructura y controlador. Cada unidad se prueba de forma aislada mediante mocks.

## Observabilidad

Los logs se emiten a través del `ConsoleLogger` de NestJS:

- **`NODE_ENV=development`**: logs con colores en consola
- **`NODE_ENV=production`**: logs en formato JSON (compatible con Grafana/Loki)

Cada operación relevante (llamada a Mulesoft, generación de JWT, errores) produce una entrada de log con el identificador del usuario involucrado.

## Decisión técnica: JWT vs OAuth 2.0

Para esta prueba técnica se implementó autenticación **JWT simple**: el cliente envía credenciales, el servicio las valida contra el core bancario y retorna un `accessToken`.

Esta decisión es adecuada para el alcance de la prueba, pero en un escenario productivo con múltiples clientes (aplicaciones móviles, portales web, integraciones de terceros), la evolución natural sería hacia **OAuth 2.0**, por las siguientes razones:

- **Delegación de acceso controlada**: OAuth permite que un cliente acceda a recursos en nombre del usuario sin exponer sus credenciales, mediante `grant_type` y `scopes` bien definidos.
- **Gestión de clientes**: cada aplicación consumidora se registra con `client_id` y `client_secret`, permitiendo auditoría y revocación granular por cliente.
- **Refresh tokens**: la sesión se puede renovar sin solicitar credenciales nuevamente, mejorando la experiencia del usuario.
- **Estándar interoperable**: clientes, gateways y herramientas de seguridad ya saben cómo manejar tokens OAuth, reduciendo fricciones de integración.
- **Separación de responsabilidades**: el Authorization Server (este microservicio) se independiza completamente del Resource Server (los servicios que consumen el token).

La migración implicaría: agregar campos `grant_type`, `client_id` y `client_secret` al request; una respuesta conforme a RFC 6749 (`token_type`, `expires_in`, `refresh_token`); un store persistente para refresh tokens y una tabla de clientes registrados.
