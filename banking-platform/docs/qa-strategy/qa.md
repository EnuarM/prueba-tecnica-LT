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

### Métricas de calidad seguidas

| Métrica | Objetivo |
|---|---|
| Cobertura de código (dominio + app) | ≥ 80 % |
| Defect escape rate (defectos encontrados en producción / total) | < 10 % |
| Test pass rate en CI | ≥ 95 % en rama principal |
| Tiempo medio de resolución de defecto Alto | ≤ 1 sprint |

---

## 8. Herramientas

| Propósito | Herramienta |
|---|---|
| Unit / Integration tests | Jest + `@nestjs/testing` + Supertest |
| Mocks de módulos | `jest.mock()`, `createMock()` de `@golevelup/ts-jest` |
| E2E frontend | Playwright |
| Cobertura | Jest `--coverage` + umbral en `jest.config.ts` |
| CI | GitHub Actions (pipeline por PR + pipeline de release) |
| Gestión de defectos | GitHub Issues con labels de severidad |

---

## 9. Mejora de procesos QA con Inteligencia Artificial

### Propuesta: GitHub Copilot + Agentes de IA como acelerador del equipo QA

La incorporación de IA en el proceso de QA no reemplaza el criterio del ingeniero; reduce el tiempo en tareas repetitivas de bajo valor (scaffolding de tests, análisis de cobertura, triaje de defectos) y libera al equipo para concentrarse en análisis de riesgo, diseño de casos de borde y revisión de lógica de negocio.

#### Herramientas propuestas

| Herramienta | Rol en el proceso QA |
|---|---|
| **GitHub Copilot (modo agente)** | Generación de suites de test a partir de criterios de aceptación; análisis de cobertura de ramas; refactoring de tests legacy |
| **Copilot Chat en PR review** | Identificación automática de paths no cubiertos al revisar un PR; sugerencias de casos de borde basadas en el diff |
| **CodiumAI / Qodo** | Generación de unit tests para funciones nuevas directamente en el editor; análisis de mutaciones |
| **Playwright AI (codegen + AI locator)** | Grabación y mantenimiento de tests E2E con localizadores semánticos resistentes a cambios de UI |

#### Aplicación concreta a este proyecto

**1. Generación de tests para la máquina de estados**

El QA describe en lenguaje natural el comportamiento esperado de `BankingRequest` y Copilot genera el esqueleto de los casos de prueba. El QA valida y ajusta los valores límite.

```typescript
// Prompt al agente:
// "Genera tests Jest para BankingRequest.abandon().
//  La solicitud puede abandonarse solo en estado CREATED o IN_REVIEW.
//  En cualquier otro estado debe lanzar InvalidStateTransitionException."

// Copilot genera la estructura; el QA revisa y complementa con datos reales
describe('BankingRequest.abandon()', () => {
  it.each(['CREATED', 'IN_REVIEW'])('allows abandonment from %s', (status) => { ... });
  it.each(['APPROVED', 'REJECTED', 'COMPLETED'])('throws from %s', (status) => { ... });
});
```

**2. Análisis de cobertura de criterios de aceptación**

En cada PR, Copilot Chat analiza los criterios de aceptación de la HU asociada y los compara contra los tests incluidos en el diff, señalando cuáles criterios no tienen cobertura explícita.

**3. Mantenimiento de tests E2E con Playwright AI**

Cuando el equipo frontend cambia un componente (ej. el formulario de login), los localizadores de los tests E2E pueden romperse. Playwright AI sugiere localizadores semánticos (`getByRole`, `getByLabel`) que son más resistentes a cambios de estructura que los selectores CSS.

**4. Triaje asistido de defectos**

Un agente con acceso a los logs de CI puede clasificar automáticamente los fallos de test como: test flaky (fallo intermitente), regresión (nuevo fallo en código existente) o defecto nuevo. Esto reduce el tiempo que el QA invierte en diferenciar ruido de defectos reales.

#### Criterios de adopción

La IA se adopta con las siguientes restricciones:

1. **El QA siempre revisa y aprueba** los tests generados — no se hace merge de tests no revisados.
2. **Los tests deben ser comprensibles**: si Copilot genera un test que el equipo no puede leer y entender en 30 segundos, se descarta.
3. **No reemplaza el diseño de casos de prueba de riesgo alto**: la máquina de estados, la lógica de autorización y el flujo de transacciones se diseñan manualmente porque requieren criterio de negocio.
4. **Métricas antes y después**: se mide el tiempo de escritura de tests por sprint antes y después de incorporar IA, para validar que el cambio aporta valor real.

---

*Documento versionado junto al código — refleja el estado de calidad del proyecto en cada release.*


