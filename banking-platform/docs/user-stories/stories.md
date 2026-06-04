# Historias de Usuario y Técnicas — Plataforma Bancaria

---

## Historias de Usuario — Micrositio (Frontend)

---

### HU-01 — Inicio de sesión seguro

**Como** cliente del banco,  
**quiero** iniciar sesión con mi número de documento y contraseña,  
**para** acceder a mis solicitudes de producto de forma segura desde el micrositio.

#### Pantalla: `/` (AuthForm)

#### Criterios de aceptación

| ID | Criterio | Resultado esperado |
|---|---|---|
| CA-01.1 | Campos visibles | El formulario muestra: Tipo de Documento (selector), Número de Documento (texto numérico, máx. 10), Contraseña (campo enmascarado) y botón "Autenticar Sesión" |
| CA-01.2 | Login exitoso | Al ingresar credenciales válidas, el sistema redirige automáticamente a `/dashboard/history` |
| CA-01.3 | Credenciales inválidas | El sistema muestra un mensaje de error genérico ("Credenciales inválidas") sin indicar cuál campo es incorrecto |
| CA-01.4 | Campos requeridos | El formulario no permite el envío si algún campo está vacío |
| CA-01.5 | Estado de carga | El botón muestra un indicador de carga mientras se procesa la solicitud; no puede enviarse dos veces |
| CA-01.6 | Enlace de soporte | El formulario incluye un enlace "¿Olvidó sus datos de acceso?" visible para el usuario |

#### Consideraciones de seguridad
- La contraseña se envía por HTTPS y nunca se almacena en el cliente
- El token de sesión se almacena en cookie `httpOnly` — no accesible desde JavaScript
- El formulario no revela si el documento o la contraseña son incorrectos (evita enumeración de usuarios)

---

### HU-02 — Creación de nueva solicitud de producto

**Como** cliente autenticado,  
**quiero** crear una solicitud de producto bancario seleccionando el tipo de producto que me interesa,  
**para** iniciar el proceso de evaluación sin necesidad de ir a una sucursal.

#### Pantalla: `/dashboard/new-application` (NewApplicationForm)

#### Criterios de aceptación

| ID | Criterio | Resultado esperado |
|---|---|---|
| CA-02.1 | Datos pre-cargados | Los campos de Tipo de Documento, Número de Documento y Nombre están pre-poblados con los datos de la sesión activa y no son editables |
| CA-02.2 | Selección de producto | El cliente puede elegir uno de los productos disponibles: Crédito Personal, Cuenta de Ahorros, Crédito Hipotecario, Tarjeta de Crédito, Fondo de Inversión |
| CA-02.3 | Selección requerida | Si el cliente no selecciona un producto, el sistema muestra un mensaje de error y no envía la solicitud |
| CA-02.4 | Envío exitoso | Al confirmar, el sistema crea la solicitud con estado `CREATED` y redirige a la pantalla de confirmación |
| CA-02.5 | Error del servicio | Si el servicio no está disponible, el sistema muestra un mensaje de error sin perder los datos del formulario |
| CA-02.6 | Información de contexto | La pantalla muestra tarjetas informativas sobre seguridad del proceso, verificación AML y tiempo estimado de aprobación |

#### Consideraciones de seguridad
- La sesión debe estar activa (JWT válido) para acceder a esta pantalla; sin sesión el gateway retorna `401`
- El `clientDocNumber` proviene de la sesión — el cliente no puede crear solicitudes a nombre de otro documento
- Los datos del formulario se validan en el gateway (`ValidationPipe`) antes de llegar al servicio de dominio

---

### HU-03 — Confirmación de solicitud creada

**Como** cliente autenticado,  
**quiero** ver una confirmación con el identificador de mi solicitud recién creada,  
**para** tener constancia de que fue recibida correctamente y poder hacer seguimiento.

#### Pantalla: `/dashboard/confirmation?id=...&product=...` (ConfirmationContent)

#### Criterios de aceptación

| ID | Criterio | Resultado esperado |
|---|---|---|
| CA-03.1 | ID visible | La pantalla muestra el identificador único (`id`) de la solicitud creada de forma destacada |
| CA-03.2 | Nombre del producto | Se muestra el nombre legible del producto solicitado (ej. "Crédito Personal" en lugar del código `PERSONAL_LOAN`) |
| CA-03.3 | Acceso al historial | La pantalla incluye un botón o enlace que lleva al cliente directamente a `/dashboard/history` |
| CA-03.4 | Información de proceso | La pantalla muestra las mismas tarjetas informativas de contexto (seguridad, AML, tiempo de respuesta) |
| CA-03.5 | Parámetros en URL | El `id` y el `product` se transmiten como query params de la URL para permitir recarga sin pérdida de información |

#### Consideraciones de seguridad
- La pantalla no realiza ninguna petición adicional al servidor — solo consume los parámetros de la URL
- El `id` es un UUID v4 generado por el servicio de dominio — no secuencial ni predecible

---

### HU-04 — Consulta y gestión del historial de solicitudes

**Como** cliente autenticado,  
**quiero** ver todas mis solicitudes de producto ordenadas cronológicamente con su estado actual,  
**para** hacer seguimiento a cada una y abandonar las que ya no me interesen.

#### Pantalla: `/dashboard/history` (HistorialPage)

#### Criterios de aceptación

| ID | Criterio | Resultado esperado |
|---|---|---|
| CA-04.1 | Listado de solicitudes | El historial muestra todas las solicitudes del cliente: ID, fecha, tipo de producto y estado |
| CA-04.2 | Resumen de contadores | La pantalla muestra tarjetas con el total de solicitudes, cantidad en revisión, aprobadas y rechazadas |
| CA-04.3 | Paginación | El historial muestra máximo 5 solicitudes por página con controles de navegación anterior/siguiente |
| CA-04.4 | Estados con color | Cada estado (`CREATED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`, `ABANDONED`) se muestra con su etiqueta en español y color diferenciado |
| CA-04.5 | Acción de abandono | Las solicitudes en estado `CREATED` o `IN_REVIEW` muestran el botón "Abandonar"; estados terminales no tienen acción disponible |
| CA-04.6 | Confirmación de abandono | Al presionar "Abandonar", el sistema solicita confirmación explícita antes de ejecutar la acción |
| CA-04.7 | Actualización inmediata | Después de abandonar una solicitud, la lista se actualiza automáticamente reflejando el nuevo estado |
| CA-04.8 | Datos frescos al navegar | Al regresar al historial después de crear una solicitud, la nueva solicitud aparece en el listado sin necesidad de recargar la página |
| CA-04.9 | Estado de carga | Mientras se cargan los datos, la tabla muestra un indicador de progreso; si hay error, muestra el mensaje correspondiente |

#### Consideraciones de seguridad
- La consulta requiere JWT válido; sin sesión el gateway retorna `401`
- El historial solo muestra solicitudes asociadas al `clientDocNumber` de la sesión activa
- La acción de abandono aplica la máquina de estados del dominio — no es posible "abandonar" una solicitud ya aprobada, rechazada o completada; el servicio retorna `422` en ese caso

---

## Historias Técnicas — Integración Micrositio ↔ Core Bancario

---

### HT-01 — Autenticación de usuario desde el micrositio hacia el core bancario

**Como** usuario autenticado del micrositio,  
**quiero** iniciar sesión con mi número de documento y contraseña,  
**para** acceder a mis productos y solicitudes bancarias de forma segura sin que mis credenciales queden expuestas en el cliente.

#### Contexto técnico

El micrositio (Next.js) delega la autenticación al `api-gateway`, que a su vez valida las credenciales contra el `authentication-service`. Este servicio consulta el core bancario (simulado via Postman Mock / Mulesoft) para verificar la identidad. Si la validación es exitosa, el gateway emite un JWT y lo persiste en una cookie `httpOnly` — el bundle del micrositio nunca accede al token.

```
[Micrositio]  →  mutation login  →  [API Gateway]
                                         ↓ POST /auth/login
                                   [authentication-service]
                                         ↓ POST /authentication-management/v1/user
                                   [Core Bancario / Mulesoft]
                                         ↑ { accessToken, user }
                               Set-Cookie: accessToken (httpOnly, sameSite=strict)
```

#### Criterios de aceptación

| ID | Criterio | Resultado esperado |
|---|---|---|
| CA-T01.1 | Credenciales válidas | El gateway retorna `{ user: { fullName, docType, docNumber } }` y setea la cookie `accessToken` con `httpOnly: true`, `sameSite: strict` |
| CA-T01.2 | Credenciales inválidas | El gateway retorna `401 Unauthorized`; el micrositio muestra mensaje de error sin revelar si el documento o la contraseña son incorrectos |
| CA-T01.3 | Core bancario no disponible | El gateway retorna `500`; el micrositio muestra un mensaje genérico de error del servicio |
| CA-T01.4 | JWT en cookie, no en body | La respuesta GraphQL de `login` no incluye el `accessToken` en ningún campo del payload — solo en el header `Set-Cookie` |
| CA-T01.5 | Expiración alineada | El `maxAge` de la cookie es igual al valor de `JWT_EXPIRES_IN` — no puede haber ventana de tiempo donde el token es válido pero la cookie expiró o viceversa |
| CA-T01.6 | Cierre de sesión limpio | Al hacer logout, el `InMemoryCache` de Apollo se descarta (`clearStore`) antes de limpiar el contexto de usuario, garantizando que no queden datos del usuario en memoria |

#### Consideraciones de seguridad

- **XSS**: `httpOnly` impide que cualquier script del micrositio lea el token mediante `document.cookie`
- **CSRF**: `sameSite: 'strict'` garantiza que la cookie no se envíe en requests originados fuera del micrositio
- **Fuerza bruta**: Rate limiting global en el gateway (10 req/s, 100 req/min). Mejora planificada: `reCAPTCHA v3` invisible
- **Tránsito**: HTTPS cifra el canal. Mejora planificada: cifrado asimétrico `RSA-OAEP` del payload de credenciales
- **Invalidación de sesión**: En esta implementación la cookie persiste hasta `maxAge` tras el logout cliente. Mejora planificada: BFF con endpoint de revocación server-side

---

### HT-02 — Gestión de solicitudes de producto bancario desde el micrositio

**Como** usuario autenticado del micrositio,  
**quiero** crear, consultar y gestionar el estado de mis solicitudes de producto bancario,  
**para** hacer seguimiento al ciclo de vida de cada solicitud sin necesidad de asistencia presencial.

#### Contexto técnico

Todas las operaciones de producto requieren un JWT válido. El micrositio envía la cookie automáticamente en cada operación GraphQL (`credentials: 'include'`). El `api-gateway` valida el JWT vía `GqlJwtAuthGuard` y reenvía la operación al `product-requests` service, que persiste en MongoDB y aplica la máquina de estados del dominio.

```
[Micrositio]  →  query/mutation (cookie adjunta)  →  [API Gateway]
                                                           ↓ JWT válido → GqlJwtAuthGuard
                                                     [product-requests service]
                                                           ↓ MongoDB 7
                                                     { id, productType, status, createdAt }
```

**Máquina de estados:**
```
CREATED → IN_REVIEW → APPROVED → COMPLETED
                    ↘ REJECTED
CREATED / IN_REVIEW → ABANDONED
```

#### Criterios de aceptación

| ID | Criterio | Resultado esperado |
|---|---|---|
| CA-T02.1 | Crear solicitud autenticado | `createProductRequest` retorna `{ id, status: "CREATED", createdAt }` — el `id` es UUID v4 |
| CA-T02.2 | Crear solicitud sin JWT | El gateway retorna `401 Unauthorized` antes de llegar al servicio de producto |
| CA-T02.3 | Consultar historial | `productRequests(clientDocNumber)` retorna el listado; el micrositio muestra paginación local de 5 registros por página |
| CA-T02.4 | Transición de estado válida | `updateProductRequestStatus` acepta transiciones permitidas y persiste el nuevo estado |
| CA-T02.5 | Transición de estado inválida | El servicio retorna `422 Unprocessable Entity`; el gateway lo propaga al micrositio |
| CA-T02.6 | Solicitud no encontrada | El servicio retorna `404 Not Found`; el gateway lo mapea a un error GraphQL |
| CA-T02.7 | Historial actualizado post-creación | Al navegar al historial después de crear una solicitud, la nueva solicitud aparece — la query usa `fetchPolicy: cache-and-network` |

#### Consideraciones de seguridad

- **Autorización**: `GqlJwtAuthGuard` valida firma y expiración del JWT en cada operación
- **`clientDocNumber` como argumento**: Diseño deliberado para soportar rol `ADMIN`. Mejora planificada: extraer `docNumber` del JWT para el rol `USUARIO`
- **Inyección**: `ValidationPipe` con `whitelist: true` en el gateway. MongoDB usa Mongoose con esquemas tipados
- **Trazabilidad**: Cada solicitud almacena `clientDocNumber`, `clientName`, `productType`, `status`, `createdAt` y `updatedAt`. Mejora planificada: log de auditoría inmutable por transición de estado


Estas historias cubren el flujo completo implementado: autenticación segura desde el micrositio y gestión de solicitudes de producto con trazabilidad hacia el core.