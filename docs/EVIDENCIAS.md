# Dossier de Evidencias de Pruebas, Seguridad y Accesibilidad

**Asignatura:** Lenguaje Programación Web II  
**Evaluación:** Evaluación 2 (Trabajo 2: Frontend, consumo de API y seguridad)  
**Estudiante:** Gustavo Jaramillo  
**Docente:** Enso Guidotti  
**Institución:** Instituto Profesional Virginio Gómez  
**Fecha de Entrega:** Octubre 2026  

---

## 1. Evidencia de Ejecución de Pruebas Automatizadas

### 1.1 Suite de Integración del Backend (`CanchasApi.Tests`)
* **Framework:** xUnit + `WebApplicationFactory<Program>` (ASP.NET Core .NET 10).
* **Comando:** `dotnet test CanchasApi.Tests`
* **Resultado:** **7 pruebas superadas, 0 con error (100% de éxito).**

```text
Determinando los proyectos que se van a restaurar...
Todos los proyectos están actualizados para la restauración.
CanchasApi -> C:\Users\usuario\Downloads\CanchasApi26-08 (1)\backend\CanchasApi\bin\Debug\net10.0\CanchasApi.dll
CanchasApi.Tests -> C:\Users\usuario\Downloads\CanchasApi26-08 (1)\backend\CanchasApi.Tests\bin\Debug\net10.0\CanchasApi.Tests.dll
Serie de pruebas para CanchasApi.Tests.dll (.NETCoreApp,Version=v10.0)

Aprobado CanchasApi.Tests.HealthTests.Health_DeberiaResponder200Y_ConexionOk
Aprobado CanchasApi.Tests.UsuarioApiTests.Registro_ConDatosValidos_Retorna201YUbicacionDelRecurso
Aprobado CanchasApi.Tests.UsuarioApiTests.Registro_ConEmailDuplicado_Retorna409Conflict
Aprobado CanchasApi.Tests.UsuarioApiTests.Registro_SinPassword_Retorna400BadRequest
Aprobado CanchasApi.Tests.UsuarioApiTests.Login_ConCredencialesValidas_Retorna200YToken
Aprobado CanchasApi.Tests.UsuarioApiTests.Login_ConCredencialesInvalidas_Retorna401Unauthorized
Aprobado CanchasApi.Tests.UsuarioApiTests.Usuarios_EndpointProtegido_RetornaRespuestaEsperada

Correctas! - Con error: 0, Superado: 7, Omitido: 0, Total: 7, Duración: 4.8 s - CanchasApi.Tests.dll (net10.0)
```

---

### 1.2 Pruebas de Componentes Frontend (`Vitest + Testing Library`)
* **Framework:** Vitest v4 + `@testing-library/react` + `jsdom`.
* **Comando:** `npm run test`
* **Resultado:** **3 suites aprobadas, 8 pruebas superadas, 0 con error (100% de éxito).**

```text
> frontend@0.0.0 test
> vitest run

 RUN  v4.1.12 C:/Users/usuario/Downloads/CanchasApi26-08 (1)/frontend

 ✓ src/test/ProtectedRoute.test.tsx (3 tests) 201ms
     ✓ debe redirigir a /login cuando un usuario no autenticado intenta acceder a una ruta protegida
     ✓ debe permitir acceso al contenido cuando el usuario está autenticado
     ✓ debe redirigir a /403 cuando un Cliente intenta acceder a una ruta de Administrador
 ✓ src/test/CanchasList.test.tsx (2 tests) 792ms
     ✓ debe renderizar el listado de canchas obtenidas desde la API
     ✓ debe mostrar estado vacío cuando no hay canchas registradas
 ✓ src/test/Login.test.tsx (3 tests) 1134ms
     ✓ debe renderizar el formulario con campos de correo y contraseña accesibles
     ✓ debe validar en cliente formato de correo electrónico inválido
     ✓ debe llamar al servicio de autenticación y almacenar token al ingresar credenciales válidas

 Test Files  3 passed (3)
      Tests  8 passed (8)
   Start at  15:56:50
   Duration  9.04s
```

---

### 1.3 Prueba End-to-End (`Playwright`)
* **Archivo:** `frontend/e2e/canchas-flow.spec.ts`
* **Flujo Evaluado:** Inicio de sesión como Administrador &rarr; Redirección a `/canchas` &rarr; Ingreso a `/canchas/nueva` &rarr; Diligenciamiento de formulario con validación Zod &rarr; Guardado &rarr; Verificación de presencia en el listado.
* **Comando:** `npm run test:e2e`

---

## 2. Evidencia de Verificación de Seguridad (OWASP)

### 2.1 Auditoría de Dependencias (`npm audit`)
* **Comando:** `npm audit`
* **Resultado:** **0 vulnerabilidades encontradas.**

```text
found 0 vulnerabilities
```

### 2.2 Control de Autenticación Rota: Respuesta 401 Unauthorized (OWASP API2)
* **Petición sin Token:** `POST http://localhost:5098/api/v1/canchas`
* **Respuesta HTTP:** `401 Unauthorized`
* **Comportamiento en Frontend:** El guardia `<ProtectedRoute>` intercepta la solicitud y redirige automáticamente a `/login?returnUrl=/canchas/nueva`. Si el token expira durante el uso, el interceptor de Axios limpia `sessionStorage` y despliega la notificación de advertencia en vivo.

### 2.3 Control de Autorización por Rol: Respuesta 403 Forbidden (OWASP API5)
* **Petición con Rol Cliente a Endpoint Administrativo:**  
  `DELETE http://localhost:5098/api/v1/canchas/1` con `Authorization: Bearer <token_cliente>`
* **Respuesta HTTP:** `403 Forbidden`
* **Comportamiento en Frontend:** Si el usuario con rol `Cliente` intenta ingresar por URL a `/canchas/nueva` o `/canchas/1/editar`, `<RoleGuard>` redirige inmediatamente a la vista `/403`, impidiendo renderizar controles administrativos.

### 2.4 Control de Fuerza Bruta: Respuesta 429 Too Many Requests (OWASP API4)
* **Configuración Backend:** `AddFixedWindowLimiter` configurado a 5 peticiones/minuto por IP en `POST /api/v1/usuarios/login`.
* **Prueba de Saturación:** Al realizar más de 5 envíos consecutivos con contraseñas erróneas:
  * **Respuesta HTTP:** `429 Too Many Requests`
  * **Comportamiento en Frontend:** El cliente normaliza el error y despliega alerta visual:  
    *"Límite de intentos excedido (Rate Limit: máx 5 solicitudes por minuto). Por seguridad, intente en 60 segundos."*

### 2.5 Neutralización de Cross-Site Scripting (XSS - OWASP Top 10 Injection)
* **Vector de Ataque:** Inyección de payload `<script>alert('Ataque XSS')</script>` en el campo de texto de un formulario.
* **Resultado:** React escapa por defecto todos los valores de variables en JSX como cadenas seguras de texto (`TextNode`). Cero ejecución arbitraria de JavaScript. Adicionalmente, el backend responde con la cabecera `X-XSS-Protection: 1; mode=block`.

### 2.6 Política CORS Restringida (OWASP API8)
* **Configuración:** `WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000")`.
* **Prueba de Acceso no Permitido:** Solicitud desde un origen no declarado (`http://sitio-malicioso.com`).
* **Resultado:** El navegador bloquea la lectura de la respuesta con el error:  
  `Access to fetch at 'http://localhost:5098/api/v1/canchas' from origin 'http://sitio-malicioso.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

---

## 3. Evidencia de Accesibilidad y Diseño Responsivo (WCAG 2.2 AA)

### 3.1 Lista de Verificación Manual con Teclado
* [x] **Enlace de Salto:** Tecla `Tab` al inicio de la página despliega el enlace visible *"Saltar al contenido principal"* (`.skip-link`).
* [x] **Foco Visible:** Todo elemento interactivo (botones, inputs, enlaces) despliega un contorno azul accesible de 3px (`outline: 3px solid #0284c7; outline-offset: 2px`).
* [x] **Modal con Focus Trap:** Al abrir el diálogo de confirmación de eliminación (`ConfirmModal.tsx`), el foco se transfiere automáticamente al botón de acción y la tecla `Tab` queda confinada dentro del modal.
* [x] **Cierre con Escape:** Al presionar la tecla `Escape`, el modal se cierra y el foco regresa al botón que lo abrió.

### 3.2 Lista de Verificación de Semántica y Formularios
* [x] **Etiquetas Explícitas:** Cada `<input>` y `<select>` cuenta con su correspondiente `<label htmlFor="...">`.
* [x] **Atributos de Error:** Los mensajes de validación están vinculados a sus campos mediante `aria-describedby` y declarados como `aria-invalid="true"`.
* [x] **Anuncios Dinámicos:** Los errores se anuncian a lectores de pantalla mediante `role="alert"` y `aria-live="polite"`.
* [x] **Atributo Lang:** Definido como `<html lang="es">` en `index.html`.
* [x] **Contraste de Color:** Ratios de contraste superiores a **4.5:1** en textos y **3:1** en bordes interactivos.

### 3.3 Verificación de Diseño Mobile-First y Responsividad
* [x] **Viewport 320 px (Móvil Pequeño):** La interfaz se adapta sin desbordamientos ni scroll horizontal. La tabla se transforma en tarjetas apiladas.
* [x] **Viewport 768 px (Tableta):** Grid fluido de tarjetas y menú responsivo accesible.
* [x] **Viewport 1024 px+ (Escritorio):** Despliegue de tabla de datos completa con navegación horizontal de encabezados.
* [x] **Área Táctil Mínima (WCAG 2.5.8):** Todos los botones y controles cumplen con el estándar mínimo de **44 &times; 44 px**.
* [x] **Ampliación / Zoom:** Soporte de zoom de texto hasta el **200%** manteniendo la legibilidad sin corte de texto.
