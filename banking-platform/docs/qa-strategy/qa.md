# Estrategia de Calidad — Plataforma de Solicitudes Bancarias

**Contexto:** Plataforma digital de solicitudes de productos bancarios compuesta por tres microservicios NestJS (api-gateway, authentication-service, product-requests) y una SPA Next.js. Arquitectura Clean, integración con core bancario vía Mulesoft.

---

## 1. Enfoque general: Shift-Left y Testing en Pirámide

La estrategia sigue el principio ISTQB de **detección temprana de defectos**: cuanto más tarde se encuentre un defecto, más caro es corregirlo. El equipo QA no valida al final del ciclo; participa desde el refinamiento de historias de usuario.

```
           /\         E2E / UAT (pocos, lentos, alto valor)
          /  \
         / Int \      Tests de integración (contratos, adapters)
        /--------\
       /  Unitario \  Tests unitarios (dominio, casos de uso)
      /______________\
```

La pirámide se materializa así en este proyecto:

| Nivel | Herramienta | Responsable principal | Cobertura objetivo |
|---|---|---|---|
| Unitario | Jest | Desarrollador + QA | ≥ 80 % dominio y aplicación |
| Integración | Jest + Supertest | QA + Dev | Contratos entre servicios, adaptador Mulesoft |
| Sistema / E2E | Playwright / Supertest | QA | Flujos críticos de negocio |
| Aceptación (UAT) | Criterios de aceptación de HU | QA Lead + PO | 100 % de criterios de aceptación |

---

## 2. Niveles de prueba (ISTQB)

### 2.1 Pruebas unitarias

**Objetivo:** verificar que cada unidad de software (clase, función, caso de uso) se comporta correctamente de forma aislada.

Áreas prioritarias para este proyecto:

- **Máquina de estados de `BankingRequest`**: todas las transiciones válidas (`CREATED → IN_REVIEW → APPROVED/REJECTED`, `CREATED → ABANDONED`) y los intentos de transición inválida que deben lanzar excepción de dominio.
- **Casos de uso** (`CreateRequestUseCase`, `UpdateRequestUseCase`, `AbandonRequestUseCase`): verificar lógica de orquestación con mocks de repositorio y del adaptador Mulesoft.
- **Value objects y entidades**: validaciones de invariantes de dominio.

```typescript
// Ejemplo representativo — transición inválida
it('should throw DomainException when abandoning an APPROVED request', () => {
  const request = BankingRequest.reconstitute({ status: 'APPROVED', ... });
  expect(() => request.abandon()).toThrow(InvalidStateTransitionException);
});
```

### 2.2 Pruebas de integración

**Objetivo:** verificar la colaboración entre componentes reales (base de datos, adaptadores HTTP, módulos NestJS).

- **Adaptador Mulesoft (`MulesoftAuthAdapter`)**: contrato con el mock de Postman — respuesta correcta, timeout, error 4xx/5xx.
- **Repositorio MongoDB**: persistencia y recuperación de `BankingRequest` con todos sus campos, incluyendo UUID como `_id`.
- **Módulos NestJS** (`product-requests`, `authentication-service`): bootstrap del contexto con `TestingModule`, verificando la cadena IoC completa.

### 2.3 Pruebas de sistema (E2E)

**Objetivo:** validar flujos completos de negocio desde la perspectiva externa al sistema.

Flujos cubiertos:

| ID | Flujo | Resultado esperado |
|---|---|---|
| E2E-01 | Login con credenciales válidas → JWT emitido | `200 OK` con `access_token` |
| E2E-02 | Login inválido | `401` sin información de diagnóstico |
| E2E-03 | Crear solicitud autenticado | `201 Created`, solicitud en estado `CREATED` |
| E2E-04 | Crear solicitud sin JWT | `401 Unauthorized` desde el gateway |
| E2E-05 | Consultar historial de solicitudes propias | `200` con lista filtrada por `clientDocNumber` del token |
| E2E-06 | Intentar acceder a solicitud de otro cliente | `403 Forbidden` |
| E2E-07 | Flujo completo: crear → revisar → completar | Estado final `COMPLETED` |

### 2.4 Pruebas de aceptación (UAT)

Los criterios de aceptación de cada historia de usuario son el contrato entre negocio y QA. Cada criterio (CA-01.1 … CA-03.5) se convierte en un caso de prueba verificable y su resultado documenta el cierre de la historia.

---

## 3. Tipos de prueba (ISTQB)

### 3.1 Funcional

Cubre los criterios de aceptación de las HU. Aplicada en todos los niveles.

### 3.2 No funcional

| Tipo | Aplicación en este proyecto |
|---|---|
| **Seguridad** | Validación JWT, autorización por `clientDocNumber`, ausencia de verbose errors en 401/403, HTTPS obligatorio, `httpOnly` cookies |
| **Rendimiento** | Verificar que el `ThrottlerModule` corta en el umbral configurado; tiempo de respuesta < 500 ms en condiciones normales para flujos críticos |
| **Usabilidad** | Mensajes de error claros en el frontend, estados de carga visibles, accesibilidad básica (WCAG AA en formularios) |
| **Confiabilidad** | Comportamiento ante Mulesoft no disponible: el sistema devuelve `503` con mensaje controlado, no stack trace |

### 3.3 Pruebas de regresión

Se ejecutan en cada PR contra `main`. El pipeline CI ejecuta el suite completo de unit + integración. Los tests E2E corren en el pipeline de release.

---

## 4. Gestión del riesgo (Risk-Based Testing)

Se priorizan las pruebas según probabilidad × impacto de fallo:

| Área | Riesgo | Prioridad |
|---|---|---|
| Máquina de estados de solicitud | Transición inválida que corrompe el estado | **Alta** |
| Autenticación / JWT | Token forjado o expirado aceptado | **Alta** |
| Aislamiento de datos por cliente | Cliente A accede a solicitudes de cliente B | **Alta** |
| Adaptador Mulesoft | Fallo silencioso devuelve datos vacíos | **Media** |
| Validación de formularios frontend | Inyección de datos maliciosos hacia el gateway | **Media** |
| Paginación del historial | Resultados incompletos o duplicados | **Baja** |

Las áreas de prioridad **Alta** tienen cobertura obligatoria antes de cualquier release.

---

## 5. Criterios de entrada y salida (ISTQB)

### Criterios de entrada por sprint

- Historia de usuario con criterios de aceptación escritos y aprobados por PO
- Código disponible en la rama del sprint con Dockerfile funcional
- Ambiente de pruebas levantado con `docker compose up`

### Criterios de salida (Definition of Done ampliado)

- Cobertura unitaria ≥ 80 % en capas dominio y aplicación
- 0 defectos críticos o bloqueantes abiertos
- Todos los criterios de aceptación documentados como PASS
- Tests E2E de flujos críticos ejecutando en verde
- Revisión de seguridad básica completada (OWASP checklist mínimo)

---

## 6. Estrategia de defectos

| Severidad | Definición | SLA resolución |
|---|---|---|
| Crítico | Sistema caído o pérdida de datos | Bloqueante — no avanza el sprint |
| Alto | Funcionalidad principal rota (ej. no se puede crear solicitud) | Mismo sprint |
| Medio | Comportamiento incorrecto con workaround disponible | Sprint siguiente |
| Bajo | Estético o mejora menor | Backlog |

Los defectos se registran con: pasos de reproducción, entorno, evidencia (log / screenshot), severidad y componente afectado.

---

## 7. Liderazgo QA — Rol y Responsabilidades

### Guía al equipo

1. **Refinamiento**: revisar criterios de aceptación con el PO, identificar ambigüedades antes de que el desarrollador empiece.
2. **Desarrollo**: pairing con devs para definir contratos de test (qué mockear, qué no); revisar cobertura en PR.
3. **Cierre**: ejecutar casos de prueba de aceptación, documentar resultado, firmar el DoD.

### Prácticas que promueve el QA Lead

- **Testing como habilidad del equipo, no del área**: los desarrolladores escriben unit tests; QA revisa su calidad y complementa con tests de integración y E2E.
- **Automatización primero**: ningún caso de prueba repetitivo se ejecuta manualmente más de dos veces. Si se puede automatizar, se automatiza.
- **Trazabilidad**: cada caso de prueba está vinculado a un criterio de aceptación o a un riesgo identificado. Nada se prueba "porque sí".
- **Feedback loop rápido**: el pipeline CI debe dar resultado en < 5 minutos para pruebas unitarias y de integración. Los desarrolladores no esperan al QA para saber si su código funciona.


## 8. Herramientas

| Propósito | Herramienta |
|---|---|
| Unit / Integration tests | Jest + `@nestjs/testing` + Supertest |
| Mocks de módulos | `jest.mock()`, `createMock()` de `@golevelup/ts-jest` |
| E2E frontend | Playwright |
| Cobertura | Jest `--coverage` + umbral en `jest.config.ts` |

---

## 9. Mejora de procesos QA con Inteligencia Artificial

### 9.1 Postman AI Agent — Automatización asistida de colecciones

Postman incorpora un agente de IA conversacional que permite generar, mantener y ejecutar colecciones de prueba sin escribir scripts manualmente. Su aplicación concreta en este proyecto:

**Generación de colecciones desde el esquema GraphQL**

El agente puede importar el schema GraphQL del api-gateway (`schema.gql`) e inferir automáticamente queries, mutations y variables de prueba para cada operación expuesta. Reduce de horas a minutos la creación inicial de la colección de smoke tests.

**Generación de test scripts desde lenguaje natural**

Dentro de cada request, el agente genera los `pm.test()` describiendo la expectativa en texto:

```
"Verificar que la respuesta sea 201 y que el campo status del body sea CREATED"
```

Resultado generado automáticamente:
```javascript
pm.test("Status 201 and body.status is CREATED", () => {
    pm.response.to.have.status(201);
    pm.expect(pm.response.json().data.createRequest.status).to.eql("CREATED");
});
```

**Mantenimiento ante cambios de contrato**

Cuando un campo cambia de nombre o un tipo se modifica en el schema, el agente detecta las discrepancias entre el schema importado y los tests existentes, y propone las correcciones. Esto evita que los tests queden desactualizados silenciosamente.

---

### 9.2 Flujos E2E automatizados con Postman Flows

Postman Flows permite encadenar requests con lógica condicional de forma visual. Los flujos críticos identificados en la sección 2.3 (E2E-01 a E2E-07) se implementan como flows reutilizables:

```
[Login] → extraer access_token
    → [Crear solicitud] con token → extraer requestId
        → [Revisar solicitud] → [Aprobar solicitud]
            → [Verificar estado COMPLETED]
```

Cada nodo del flow puede tener assertions propias. El resultado es un flujo de negocio completo ejecutable con un solo clic o desde CLI con Newman.

---

### 9.3 Ejecución en CI con Newman

Las colecciones generadas y mantenidas en Postman se exportan y ejecutan en el pipeline con Newman:

```bash
newman run collection.json \
  --environment env.staging.json \
  --reporters cli,junit \
  --reporter-junit-export results/postman-results.xml
```

El reporte JUnit se publica en el pipeline (GitHub Actions, Jenkins) junto con los resultados de Jest, consolidando toda la evidencia de pruebas en un solo artefacto por build.

---

### 9.4 Generación de datos de prueba con IA

El agente de Postman puede generar conjuntos de datos dinámicos (data-driven testing) para casos como:

- Múltiples combinaciones de `productType` y `amount` para validar reglas de negocio
- Datos de clientes con distintos `documentType` para verificar validaciones del gateway
- Escenarios de borde: montos negativos, strings vacíos, campos opcionales ausentes

Esto reemplaza la creación manual de archivos CSV de datos de prueba y garantiza mayor cobertura de variantes con menos esfuerzo.

---

### 9.5 Estrategia de gestión de datos de prueba

Uno de los problemas recurrentes que más impacta la productividad del área QA es la dependencia de datos inconsistentes, incompletos o deteriorados en los ambientes de prueba. El equipo pierde tiempo valioso de pruebas bloqueado por precondiciones de datos que no están listas, en lugar de ejecutando casos y encontrando defectos.

**El problema concreto:**
- Datos de clientes o solicitudes en estado inconsistente entre servicios
- Ambientes de staging con datos "vivos" modificados por otras ejecuciones previas
- Ausencia de un proceso formal para preparar y restaurar el estado inicial antes de cada ciclo de pruebas

**Impacto esperado:** reducir el tiempo perdido en preparación y corrección de datos de prueba, convirtiendo ese tiempo en ejecución efectiva de casos y cobertura real de escenarios de negocio. Busqueda de integracion con equipo core para el tratamiento de data, buscando un estandar.



