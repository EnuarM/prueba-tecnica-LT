# product-requests

Microservicio responsable del ciclo de vida completo de las solicitudes de productos bancarios. Es el dominio principal de la plataforma: gestiona la creación, consulta y transición de estado de cada solicitud, con una máquina de estados que garantiza que solo las transiciones válidas sean posibles.

---

## Responsabilidad

Recibe operaciones del API Gateway y las ejecuta contra MongoDB. No valida tokens JWT — la autenticación es responsabilidad del gateway. El dominio no conoce NestJS, Mongoose ni HTTP: sus entidades y reglas de negocio son clases TypeScript puras.

---

## Arquitectura

Sigue **Clean Architecture** con la regla de dependencia estricta.

```
src/
├── domain/
│   ├── entities/            # ProductRequest (entidad raíz del agregado)
│   ├── enums/               # ProductRequestStatus, ProductType
│   ├── exceptions/          # InvalidStatusTransitionException, ProductRequestNotFoundException
│   ├── repositories/        # ProductRequestRepository (contrato abstracto)
│   └── value-objects/       # ProductRequestStateMachine (lógica de transición)
├── application/
│   ├── use-cases/           # Un caso de uso por operación (5 en total)
│   └── dtos/                # DTOs de entrada y salida
├── infrastructure/
│   └── database/
│       └── repositories/    # MongooseProductRequestRepository
├── database/                # Schemas de Mongoose y módulo de DB
└── presentation/
    ├── controllers/         # ProductRequestsController
    └── filters/             # DomainExceptionFilter
```

---

## Máquina de estados

El ciclo de vida de una solicitud está controlado por `ProductRequestStateMachine`, un value object del dominio que define las transiciones válidas. Cualquier intento de transición no permitida lanza `InvalidStatusTransitionException` (error de dominio puro, no HTTP).

```mermaid
stateDiagram-v2
    [*] --> CREATED : crear solicitud

    CREATED --> IN_REVIEW : revisar
    CREATED --> ABANDONED : abandonar

    IN_REVIEW --> APPROVED : aprobar
    IN_REVIEW --> REJECTED : rechazar
    IN_REVIEW --> ABANDONED : abandonar

    APPROVED --> COMPLETED : completar
    APPROVED --> ABANDONED : abandonar

    REJECTED --> [*]
    COMPLETED --> [*]
    ABANDONED --> [*]
```

`REJECTED`, `COMPLETED` y `ABANDONED` son estados terminales — ninguna transición sale de ellos.

---

## Endpoints

Todos los endpoints son internos: solo el API Gateway los invoca. No están expuestos directamente a internet.

| Método | Ruta | Caso de uso | Respuesta |
|--------|------|-------------|-----------|
| `POST` | `/product-requests` | `CreateProductRequestUseCase` | `201` con la solicitud creada |
| `GET` | `/product-requests?clientDocNumber=` | `ListProductRequestsUseCase` | `200` con array de solicitudes |
| `GET` | `/product-requests/:id` | `GetProductRequestUseCase` | `200` o `404` |
| `PATCH` | `/product-requests/:id/status` | `UpdateProductRequestStatusUseCase` | `200` o `404` / `422` |
| `DELETE` | `/product-requests/:id` | `DeleteProductRequestUseCase` | `204` o `404` |

### Códigos de error de dominio

| Excepción | HTTP | Cuándo ocurre |
|---|---|---|
| `ProductRequestNotFoundException` | `404 Not Found` | El ID no existe en MongoDB |
| `InvalidStatusTransitionException` | `422 Unprocessable Entity` | La transición de estado no es válida según la máquina de estados |

### Contratos de los endpoints principales

**`POST /product-requests`**
```json
// Request
{ "clientDocNumber": "12345678", "clientName": "John Doe", "productType": "PERSONAL_LOAN" }

// Response 201
{ "id": "uuid", "clientDocNumber": "12345678", "clientName": "John Doe", "productType": "PERSONAL_LOAN", "status": "CREATED", "createdAt": "...", "updatedAt": "..." }
```

**`PATCH /product-requests/:id/status`**
```json
// Request
{ "status": "IN_REVIEW" }

// Response 422 (transición inválida)
{ "statusCode": 422, "error": "InvalidStatusTransitionException", "message": "Cannot transition from 'COMPLETED' to 'IN_REVIEW'" }
```

### Tipos disponibles

**`ProductType`**: `PERSONAL_LOAN` | `SAVINGS_ACCOUNT` | `MORTGAGE` | `CREDIT_CARD` | `INVESTMENT_FUND`

**`ProductRequestStatus`**: `CREATED` | `IN_REVIEW` | `APPROVED` | `REJECTED` | `COMPLETED` | `ABANDONED`

---

## Decisiones de diseño

### Consulta siempre filtrada por cliente

No existe `findAll()` sin filtro. Toda consulta de listado requiere `clientDocNumber`. Las razones son:

- **Seguridad**: un endpoint sin filtro expondría solicitudes de todos los clientes a cualquier llamador interno que no segmente correctamente.
- **Performance**: evita collection scans en MongoDB. El campo `clientDocNumber` tiene índice en el schema de Mongoose.

Si en el futuro se necesita un listado administrativo, el diseño es extensible: agregar `findAll()` en `ProductRequestRepository` e implementarlo en `MongooseProductRequestRepository`. El caso de uso no existe hoy porque no hay un requisito que lo justifique (YAGNI).

### Autenticación delegada al API Gateway

Este servicio no valida JWT. El gateway autentica cada request antes de reenviarlo.

**El problema con el query param actual**

Hoy `clientDocNumber` llega como `?clientDocNumber=<valor>` en la URL. Esto tiene dos problemas:

1. **Manipulable por el llamador**: cualquier servicio interno (o un atacante que llegue a la red interna) puede pasar el `docNumber` de otro cliente y obtener sus solicitudes.
2. **Sin validación de presencia**: si el parámetro no se envía, llega `undefined` al repositorio, y `model.find({ clientDocNumber: undefined })` en Mongoose devuelve **todos los documentos de la colección** sin filtro — un leak masivo de datos.

**Por qué está bien para esta prueba**

El único llamador real es el API Gateway, que está en la misma red privada del cluster. El gateway extrae el `docNumber` del JWT antes de llamar a este servicio, por lo que en la práctica el valor siempre es el del usuario autenticado. El riesgo es real solo si alguien accede directamente al puerto `3002`, que no está expuesto a internet.

**Cómo se implementaría en producción**

El gateway inyecta el `clientDocNumber` como header interno después de validar el token, y este servicio lo extrae del header en lugar del query param:

```typescript
// En el API Gateway — después de validar el JWT
const clientDocNumber = jwtPayload.govIssueIdent.identSerialNum;
axios.get(`${productRequestsUrl}/product-requests`, {
  headers: { 'X-Client-Doc-Number': clientDocNumber },
});

// En este servicio — controlador
@Get()
async findAll(
  @Headers('x-client-doc-number') clientDocNumber: string,
): Promise<ProductRequestResponseDto[]> { ... }
```

Con este esquema el cliente nunca puede alterar qué `docNumber` se consulta — el valor viene del token firmado, no de la URL.

**Qué falta para blindar el estado actual**

Mientras el query param se mantenga, la solución mínima es validar que no sea vacío antes de llegar al repositorio. Sin embargo, lanzar `BadRequestException` de NestJS en el caso de uso violaría Clean Architecture (la capa de aplicación dependería de un tipo HTTP de NestJS). La forma correcta es una excepción de aplicación propia que el filtro mapee a `400`:

```typescript
// application/exceptions/missing-client-doc-number.exception.ts
export class MissingClientDocNumberException extends Error {
  constructor() {
    super('clientDocNumber is required');
    this.name = 'MissingClientDocNumberException';
  }
}

// list-product-requests.use-case.ts
async execute(clientDocNumber: string): Promise<ProductRequest[]> {
  if (!clientDocNumber?.trim()) {
    throw new MissingClientDocNumberException();
  }
  return this.repository.findByClientDocNumber(clientDocNumber);
}

// presentation/filters/domain-exception.filter.ts  — agregar al @Catch()
// MissingClientDocNumberException → 400 Bad Request
```

### UUID como identificador

Las solicitudes usan `randomUUID()` de Node.js como `id`. Esto evita exponer secuencias predecibles de MongoDB ObjectId, facilita los tests deterministas y hace el identificador portable si la base de datos cambia.

### Máquina de estados en el dominio, no en la base de datos

La lógica de transición vive en `ProductRequestStateMachine`, un value object de dominio puro (sin dependencias de NestJS ni Mongoose). Esto garantiza que la regla "no se puede ir de COMPLETED a IN_REVIEW" se valide antes de tocar la base de datos, y que sea testeable de forma aislada y rápida.

---

## Variables de entorno

| Variable | Descripción | Requerida | Default |
|---|---|---|---|
| `PORT` | Puerto del servicio | No | `3002` |
| `NODE_ENV` | Entorno (`development` / `production` / `test`) | No | `development` |
| `MONGODB_URI` | URI de conexión a MongoDB | Sí | — |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos | No | `http://localhost:3000` |
| `THROTTLE_TTL_MS` | Ventana de rate limiting en ms | No | `60000` |
| `THROTTLE_LIMIT` | Máximo de requests por ventana | No | `100` |

---

## Ejecución local

```bash
npm install

cat > .env << 'EOF'
PORT=3002
NODE_ENV=development
MONGODB_URI=mongodb://root:secret@localhost:27017/banking_platform?authSource=admin
EOF

npm run start:dev
```

## Ejecución con Docker

```bash
# Levanta este servicio y MongoDB (dependencia declarada en docker-compose)
docker compose up product-requests

# Todo el stack
docker compose up -d
```

---

## Tests

```bash
npm run test        # unitarios
npm run test:cov    # cobertura
npm run test:e2e    # end-to-end
npm run test:watch  # watch mode
```

### Estrategia de testing

La máquina de estados y las excepciones de dominio se testean completamente sin NestJS. Los casos de uso se testean inyectando un mock de `ProductRequestRepository`. El controlador y el filtro se testean con el módulo de testing de NestJS, mockeando los casos de uso.

```mermaid
flowchart LR
    T([Test]) -->|inyecta| UC[Caso de uso]
    UC -->|ProductRequestRepository| MR["mockRepository<br/>findById / save / update / delete<br/>↳ datos fijos"]

    style T fill:#1e3a5f,color:#ffffff,stroke:#1e3a5f
    style UC fill:#4a4a00,color:#ffffff,stroke:#888800
    style MR fill:#1a4731,color:#ffffff,stroke:#2d7a4f
```

### Cobertura por capa

| Capa | Qué se testea |
|---|---|
| `domain/exceptions` | Mensajes y nombres de `InvalidStatusTransitionException`, `ProductRequestNotFoundException` |
| `domain/value-objects` | Todas las transiciones válidas e inválidas de `ProductRequestStateMachine` |
| `application/use-cases` | Los 5 casos de uso: camino feliz, entidad no encontrada, transición inválida |
| `presentation/filters` | `DomainExceptionFilter` → `404` para not found, `422` para transición inválida |
| `presentation/controllers` | `ProductRequestsController` → delega correctamente a cada caso de uso |

---

## Observabilidad

Los logs se emiten a través del `ConsoleLogger` de NestJS:

- **`NODE_ENV=development`**: texto con colores en consola
- **`NODE_ENV=production`**: JSON estructurado (compatible con Grafana/Loki)

### Eventos registrados

| Evento | Nivel | Campos incluidos |
|---|---|---|
| Solicitud creada | `log` | `id`, `clientDocNumber`, `productType` |
| Estado actualizado | `log` | `id`, estado anterior → nuevo estado |
| Solicitud eliminada | `log` | `id` |
| Entidad no encontrada | `warn` | `id` buscado |
| Transición inválida | `warn` | `id`, `from`, `to` |

### Deuda técnica: auditoría de transiciones

El campo `updatedAt` registra cuándo cambió la solicitud, pero no *qué* cambió ni *quién* lo hizo. En producción se necesitaría un log de auditoría inmutable: cada transición de estado genera un evento con `{ id, from, to, actor, timestamp }`, persistido en una colección separada. Esto permite reconstruir el historial completo de una solicitud sin depender de snapshots.

---

## Alcance de esta implementación vs entorno productivo

| Aspecto | Estado en esta prueba | En producción |
|---|---|---|
| `clientDocNumber` como query param | Manipulable; si se omite devuelve todos los docs | Header `X-Client-Doc-Number` inyectado por gateway desde JWT |
| Validación de presencia de `clientDocNumber` | No implementada — `undefined` → collection scan | `BadRequestException` en el caso de uso si el valor es vacío |
| Índices en MongoDB | `clientDocNumber` indexado | + índices compuestos según patrones de consulta reales |
| Rate limiting | 10 req/s, 100 req/min global | Límites por endpoint y por cliente |
| Paginación | No implementada | Cursor-based pagination para listados grandes |
| Auditoría de cambios de estado | Solo `updatedAt` | Log de cada transición con actor, timestamp y estado anterior |
| Tests e2e | Estructura creada | Flujo completo contra MongoDB de test con datos reales |

