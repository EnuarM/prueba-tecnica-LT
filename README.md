# Banking Platform — Prueba Técnica Líder Técnico

Plataforma bancaria para gestión de solicitudes de productos financieros, desarrollada como prueba técnica para el rol de Líder Técnico.

---

## Estructura del proyecto

```
banking-platform/
├── apps/
│   ├── backend/
│   │   ├── api-gateway/            # Punto de entrada público — GraphQL federation, auth JWT, rate limiting
│   │   ├── authentication-service/ # Emisión y validación de JWT, gestión de usuarios
│   │   └── product-requests/       # Dominio principal — CRUD de solicitudes, máquina de estados, Clean Architecture
│   └── frontend/                   # Next.js 15 — UI bancaria, Apollo Client, autenticación SSR
├── docs/
│   ├── qa-strategy/qa.md           # Estrategia de QA y matriz de pruebas
│   └── user-stories/stories.md     # Historias de usuario y criterios de aceptación
└── docker-compose.yml
```

### Backend — READMEs por servicio

Cada servicio tiene su propio README con detalles de arquitectura, variables de entorno, endpoints y comandos de desarrollo:

- [api-gateway](banking-platform/apps/backend/api-gateway/README.md) — GraphQL gateway, Apollo Federation, JWT guard, ThrottlerModule
- [authentication-service](banking-platform/apps/backend/authentication-service/README.md) — Registro, login, emisión de tokens, Clean Architecture
- [product-requests](banking-platform/apps/backend/product-requests/README.md) — Solicitudes de productos, máquina de estados, integración Core Banking (mock Mulesoft)

### Frontend — README

- [frontend](banking-platform/apps/frontend/README.md) — Next.js 15, Apollo Client, módulos por dominio, cobertura Jest

---

## Levantar todo el stack

### Prerrequisito
- Docker Desktop corriendo

### Un solo comando

```bash
cd banking-platform
docker compose up -d
```

Esto levanta en orden correcto según las dependencias declaradas en `docker-compose.yml`:
MongoDB → authentication-service → product-requests → api-gateway → frontend

Para detener:
```bash
docker compose down
```

> Para desarrollo local, configuración de variables de entorno, ejecución de tests y detalles de cada servicio, ver el README correspondiente en la carpeta de cada app.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| API Gateway | NestJS + Apollo Federation + GraphQL |
| Microservicios | NestJS + TypeScript 5.7 strict mode |
| Base de datos | MongoDB 7 (Mongoose ODM) |
| Frontend | Next.js 15 + React 19 + Tailwind CSS |
| Testing | Jest + Supertest + React Testing Library |
| Contenedores | Docker + Docker Compose |
| Seguridad | Helmet, JWT, ThrottlerModule, ValidationPipe |

---

## Arquitectura: Backend orientado a microservicios

### Los tres servicios

```
banking-platform/
├── apps/
│   └── backend/
│       ├── api-gateway/            # Puerto 3000 — API pública, auth, agregación GraphQL
│       ├── authentication-service/ # Puerto 3001 — Autenticación JWT
│       └── product-requests/       # Puerto 3002 — Solicitudes de productos (núcleo)
├── docs/
└── docker-compose.yml
```

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

## Propuestas de liderazgo técnico

> Este apartado recoge propuestas que van más allá del código entregado: decisiones de proceso, cultura de equipo y evolución técnica que asumiría como líder técnico.


### 1. Estrategia de branching y revisión de código

Definir una convención de ramas clara (`main`, `develop`, `feature/*`, `hotfix/*`) con reglas de protección en `main` y `develop`: PR obligatorio, al menos una aprobación del LT o arquitecto, y pipeline CI en verde como requisito de merge. El LT no aprueba cada PR individualmente, pero sí revisa patrones recurrentes, define guías de estilo en el repositorio y actúa como desempate en decisiones de arquitectura que emergen durante la revisión.

### 2. Observabilidad y monitoreo en producción

Definir umbrales de alerta con severidad (warning / critical) y canales de notificación diferenciados. El objetivo no es que el LT revise los dashboards manualmente, sino que el sistema avise proactivamente antes de que un problema impacte al usuario.

### 3. Gestión de deuda técnica

Institucionalizar la deuda técnica como un ítem de backlog con el mismo nivel de visibilidad que las historias de usuario. En cada sprint se reserva una capacidad fija (típicamente 15–20 %) para abordar deuda priorizada. La deuda se registra con impacto concreto (ej. "este módulo no tiene cobertura de tests, bloquea cambios rápidos") y no como lista de deseos técnicos. La transversalidad actual del equipo se aprovecha para que los mismos desarrolladores que detectan la deuda propongan y ejecuten la solución.

### 4. Onboarding técnico y documentación viva

La documentación que no se actualiza con el código deja de ser útil. La propuesta es tratar los READMEs, ADRs y diagramas de arquitectura como artefactos de primera clase: el DoD de cada historia incluye actualizar la documentación afectada. Para nuevos integrantes, definir un camino de onboarding de dos semanas con hitos concretos (leer arquitectura → levantar el stack → resolver un ticket pequeño → pair programming con el equipo).

### 5. Seguridad continua (DevSecOps)

El LT mantiene un checklist OWASP mínimo como criterio de salida de cada release, y promueve la cultura de que la seguridad es responsabilidad del equipo completo, no de un área separada.

