# Banking Platform — Prueba Técnica Líder Técnico

Plataforma bancaria para gestión de solicitudes de productos financieros, desarrollada como prueba técnica para el rol de Líder Técnico.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | NestJS (latest) + TypeScript 5.7 strict mode |
| Base de datos | MongoDB 7 (Mongoose ODM) |
| Testing | Jest + Supertest |
| Contenedores | Docker + Docker Compose |
| Seguridad | Helmet, JWT, ThrottlerModule, ValidationPipe |

---

## Arquitectura: Backend orientado a microservicios

### Estructura de carpetas

```
banking-platform/
├── apps/
│   └── backend/
│       ├── gateway/              # Puerto 3000 — API pública, auth, agregación
│       ├── customer-service/     # Puerto 3001 — Datos de clientes
│       └── product-requests/     # Puerto 3002 — Solicitudes de productos (núcleo)
├── docs/
└── docker-compose.yml
```

### Los tres servicios

#### `gateway` (puerto 3000)
Punto de entrada único para todos los clientes. Responsabilidades:
- Autenticación JWT (login, validación de token)
- Routing y agregación de respuestas desde los servicios internos
- Rate limiting global (Helmet + ThrottlerModule)
- Exposición de la API versionada (`/api/v1/...`)

#### `customer-service` (puerto 3001)
Servicio de datos de clientes. Responsabilidades:
- Exponer información básica del cliente (`nombre`, `apellido`, `tipoDoc`, `numDoc`)
- Datos mockeados en esta fase (sin base de datos propia)
- En producción: integración con el core bancario o CRM

#### `product-requests` (puerto 3002)
Núcleo de negocio. Implementa Clean Architecture completa. Responsabilidades:
- CRUD completo de solicitudes de productos bancarios
- Máquina de estados para el ciclo de vida de cada solicitud
- Integración con Core Banking (mock de Mulesoft)
- Persistencia en MongoDB

---

## Por qué esta arquitectura

### El problema con un monolito

La solución más rápida habría sido un único proyecto NestJS con todos los módulos adentro. Es perfectamente válida para una prueba técnica pequeña, pero presenta problemas estructurales que se vuelven evidentes en cuanto el sistema crece:

- **Acoplamiento implícito**: los módulos de autenticación, clientes y solicitudes comparten el mismo proceso. Un fallo en cualquiera afecta a todos.
- **Escalado todo-o-nada**: si las solicitudes de productos tienen picos de carga, hay que escalar todo el monolito aunque `customer-service` esté ocioso.
- **Despliegues de alto riesgo**: cambiar la lógica de una solicitud requiere redesplegar también auth y clientes.
- **Límite de equipo**: con un monolito, múltiples equipos trabajando en paralelo generan conflictos de merge y dependencias implícitas.

### Por qué tres servicios

La decisión se tomó siguiendo el principio de **separación de responsabilidades por dominio de negocio**, no por razones técnicas artificiales:

1. **`gateway`** existe porque la autenticación y el enrutamiento son una preocupación transversal, independiente de cualquier lógica de negocio.
2. **`customer-service`** existe porque los datos de clientes probablemente provienen de un sistema externo (CRM, core bancario) y deben poder cambiar sin tocar la lógica de solicitudes.
3. **`product-requests`** es el dominio principal y merece aislamiento total para poder evolucionar, testearse y desplegarse de forma independiente.

### El costo inicial vale la pena

Sí, configurar tres proyectos NestJS, tres `tsconfig.json`, tres `package.json` y tres entradas en `docker-compose` tiene más fricción que un monolito. Este costo se amortiza desde el primer sprint porque:

- Cada servicio tiene sus propias dependencias: `product-requests` tiene Mongoose, la máquina de estados y el cliente HTTP de Mulesoft; `gateway` no necesita nada de eso.
- Los tests son más rápidos y focalizados: no hay que cargar el contexto de toda la aplicación para testear una regla de negocio.
- El onboarding es más claro: un nuevo desarrollador puede leer solo `product-requests` para entender el dominio principal, sin ruido de infraestructura.
- La migración a un orquestador (Kubernetes, ECS) es directa: cada servicio ya es una imagen Docker independiente.

### Clean Architecture en `product-requests`

El servicio principal sigue las cuatro capas de Clean Architecture con la regla de dependencia estricta (las capas internas no conocen las externas):

```
presentation/     ← Controllers, DTOs, HTTP (NestJS)
    ↓
application/      ← Use Cases, Commands, Queries (lógica de aplicación)
    ↓
domain/           ← Entities, Value Objects, Repository interfaces, Excepciones
    ↑
infrastructure/   ← Mongoose schemas, repositorios concretos, cliente Mulesoft
```

El dominio no importa nada de NestJS ni de Mongoose. Las entidades son clases TypeScript puras. Esto garantiza que las reglas de negocio se puedan testear sin levantar ningún framework.

---

## Máquina de estados — Ciclo de vida de una solicitud

```
                    ┌─────────┐
                    │ CREATED │
                    └────┬────┘
                         │ revisar()
                    ┌────▼────┐
                    │IN_REVIEW│
                    └──┬───┬──┘
             aprobar() │   │ rechazar()
              ┌────────┘   └────────┐
         ┌────▼────┐           ┌────▼────┐
         │APPROVED │           │REJECTED │ ← terminal
         └────┬────┘           └─────────┘
              │ completar()
         ┌────▼─────┐
         │COMPLETED │ ← terminal
         └──────────┘

  Desde cualquier estado no-terminal:
         abandonar() → ABANDONED ← terminal
```

Las transiciones inválidas lanzan `InvalidStatusTransitionException` (excepción de dominio, no HTTP).

---

## Seguridad (OWASP Top 10)

| Amenaza | Mitigación |
|---|---|
| Inyección | `ValidationPipe` con `whitelist + forbidNonWhitelisted`, Mongoose tipado |
| Auth rota | JWT con expiración, validación en gateway |
| Exposición de datos | DTOs de respuesta explícitos, sin `toObject()` directo |
| Rate limiting | `ThrottlerModule` 10 req/s, 100 req/min por IP |
| Configuración insegura | `Helmet`, CORS desde variable de entorno |
| Variables de entorno | Validación con Joi al arrancar; fallo rápido si falta algo |

---

## Cómo ejecutar

### Prerrequisitos
- Docker Desktop
- Node.js 20+
- `npm i -g @nestjs/cli`

### Levantar infraestructura
```bash
docker-compose up -d
```

### Ejecutar cada servicio
```bash
# Terminal 1
cd apps/backend/gateway && npm run start:dev

# Terminal 2
cd apps/backend/customer-service && npm run start:dev

# Terminal 3
cd apps/backend/product-requests && npm run start:dev
```

### Tests
```bash
# Desde cada servicio
npm run test          # unitarios
npm run test:e2e      # end-to-end
npm run test:cov      # cobertura
```

### Swagger (solo en desarrollo)
- Gateway: http://localhost:3000/api/docs
- Product Requests: http://localhost:3002/api/docs

---

## Decisiones de arquitectura (ADR)

| ID | Decisión | Razón |
|---|---|---|
| ADR-001 | UUID string como `_id` en MongoDB | Evita exponer ObjectId internos, facilita portabilidad y tests deterministas |
| ADR-002 | HTTP REST síncrono entre servicios | Simplicidad para la prueba; en producción se evaluaría message broker (RabbitMQ/Kafka) para operaciones asíncronas |
| ADR-003 | JWT solo en gateway | Los servicios internos confían en la red privada Docker; no duplicar lógica de auth |
| ADR-004 | Mock de Mulesoft en infrastructure | Permite testear el dominio sin dependencia externa; el contrato del adapter es la interfaz, no la implementación |
| ADR-005 | `commonjs` + `moduleResolution: node` | Compatibilidad garantizada con el ecosistema NestJS/Jest; evita el error TS5103 de `nodenext` con decorators |
