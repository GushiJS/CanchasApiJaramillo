# Bitácora de Uso de Inteligencia Artificial Generativa

**Estudiante:** Gustavo Jaramillo  
**Asignatura:** Lenguaje Programación Web II  
**Institución:** Instituto Profesional Virginio Gómez  
**Evaluación:** Evaluación 2 (Trabajo 2: Frontend, consumo de API y seguridad)  
**Fecha:** Octubre 2026  

---

## 1. Declaración Formal de Herramienta y Modelo

* **Herramienta:** Google Antigravity IDE (Asistente Agentic de Programación en Pareja).
* **Modelo Utilizado:** Gemini 3.8 Flash (High Context).
* **Tipo de Cuenta / Plan:** Institucional / Entorno de desarrollo avanzado.

---

## 2. Registro de Prompts y Decisiones Críticas

A continuación se detallan los prompts relevantes utilizados a lo largo del ciclo de vida del proyecto, especificando qué elementos fueron aceptados, qué correcciones manuales o técnicas se aplicaron y por qué.

### 2.1 Fase 1: Arquitectura y Diagnóstico del Backend

* **Prompt Empleado:**
  > *"Basándote en el PDF de la rúbrica de la Evaluación 2, genera un plan integral con todo lo requerido para el sistema de Canchas (Trabajo 1), organizando el repositorio como monorepo con backend y frontend, y conectándolo a https://github.com/GushiJS/CanchasApiJaramillo."*
* **Respuesta de la IA:**
  * Planteó un plan maestro en 8 fases cubriendo arquitectura React + Vite + TypeScript, CORS, Rate Limiting, autenticación JWT, RBAC, accesibilidad WCAG 2.2 AA y pruebas.
  * Sugirió migrar la estructura desordenada hacia `backend/` y `frontend/`.
* **Decisiones del Estudiante:**
  * **Aceptado:** La estructura monorepo con `backend/` y `frontend/` y la matriz de 7 riesgos OWASP.
  * **Corregido / Ajustado:** Al ejecutar `dotnet test`, la suite del Trabajo 1 falló inicialmente porque `CustomWebApplicationFactory` intentaba registrar dos proveedores de base de datos simultáneamente (`Microsoft.EntityFrameworkCore.SqlServer` y `Microsoft.EntityFrameworkCore.InMemory`). Se corrigió aislando el proveedor en memoria mediante un `inMemoryServiceProvider` independiente y configurando las variables de entorno `Jwt__Key` en el constructor estático del factory de pruebas.

---

### 2.2 Fase 2: Seguridad en Backend y Consumo desde Navegador

* **Prompt Empleado:**
  > *"Configura en Program.cs del backend .NET la política CORS restringida al frontend de Vite, añade Rate Limiting para el endpoint de login y aplica cabeceras de seguridad HTTP estándar según la rúbrica."*
* **Respuesta de la IA:**
  * Propuso agregar `AddCors` con `WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")`.
  * Propuso `Microsoft.AspNetCore.RateLimiting` con un `FixedWindowLimiter` de 5 intentos por minuto en `/api/v1/usuarios/login`.
  * Middleware para inyectar `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` y `X-XSS-Protection`.
* **Decisiones del Estudiante:**
  * **Aceptado:** Todas las políticas de seguridad y la aplicación de `.RequireRateLimiting("LoginLimiter")` en `UsuarioApi.cs`.
  * **Corregido:** Se añadió `AllowCredentials()` en la política CORS para soportar futuros envíos de cookies o cabeceras con autorización sin generar errores de preflight (OPTIONS).

---

### 2.3 Fase 3: Conexión a Base de Datos SQL Server Local

* **Prompt Empleado:**
  > *"Conéctate a mi instancia DESKTOP-BTUPOMU\SQLEXPRESS y corre las migraciones necesarias con dotnet-ef."*
* **Respuesta de la IA:**
  * Identificó que `dotnet user-secrets` no tenía credenciales configuradas en el entorno local.
  * Configuró `ConnectionStrings:miconexion` con `Server=DESKTOP-BTUPOMU\SQLEXPRESS;Initial Catalog=ReservasCanchasDB;Integrated Security=True;Encrypt=False;TrustServerCertificate=True`.
  * Generó y guardó una clave JWT aleatoria y segura en el almacén de secretos.
  * Instaló globalmente `dotnet-ef` y ejecutó `dotnet ef database update`.
  * Implementó `DbInitializer.cs` para sembrar datos iniciales (Admin, Cliente, Sedes y Tipos de Cancha) automáticamente.
* **Decisiones del Estudiante:**
  * **Aceptado:** La automatización de la semilla y la configuración en `user-secrets` para no dejar contraseñas hardcodeadas en `appsettings.json`.

---

### 2.4 Fase 4: Frontend, Consumo de API y Manejo de Estado

* **Prompt Empleado:**
  > *"Crea la aplicación en React con Vite y TypeScript, cliente Axios con interceptor Bearer y normalización de errores 401/403/429, estado asíncrono con TanStack Query, formularios con React Hook Form + Zod, y vistas completas del CRUD de Canchas."*
* **Respuesta de la IA:**
  * Generó los servicios desacoplados `canchasService.ts`, `authService.ts`, `sedesService.ts` y `tipoCanchasService.ts`.
  * Implementó `AuthContext.tsx` con almacenamiento de token en `sessionStorage` y control de expiración por eventos (`auth:expired`).
  * Desarrolló las páginas `CanchasList.tsx` (con filtros dinámicos, tabla en escritorio y tarjetas en móvil), `CanchaDetail.tsx`, `CanchaForm.tsx`, `Forbidden.tsx` y `NotFound.tsx`.
* **Decisiones del Estudiante:**
  * **Aceptado:** El flujo de autenticación, el diseño limpio y las tarjetas móviles.
  * **Corregido:** TypeScript arrojó incompatibilidad en `verbatimModuleSyntax` y tipado de resolvers en `CanchaForm.tsx` con Zod 4. Se ajustó `tsconfig.app.json` relajando `verbatimModuleSyntax` y asegurando compatibilidad en los esquemas sin romper el tipado estricto.

---

### 2.5 Fase 5: Accesibilidad WCAG 2.2 AA y Pruebas Automatizadas

* **Prompt Empleado:**
  > *"Asegura cumplimiento WCAG 2.2 nivel AA (foco visible, contraste, atributos aria, mobile-first con tarjetas, mínimo 44x44px táctil, lang en español) y crea la suite de pruebas unitarias con Vitest y React Testing Library."*
* **Respuesta de la IA:**
  * Generó `index.css` con variables CSS de alto contraste, foco visible y touch targets de 44px.
  * Creó componentes accesibles con modal que atrapa el foco (`ConfirmModal.tsx`) y soporte para la tecla `Escape`.
  * Desarrolló pruebas automatizadas en `src/test/`: `Login.test.tsx`, `ProtectedRoute.test.tsx` y `CanchasList.test.tsx`.
* **Decisiones del Estudiante:**
  * **Aceptado:** La implementación de Focus Trap y los anuncios `aria-live`.
  * **Corregido:** En `Login.test.tsx`, el selector `getByRole('alert')` fallaba porque la vista contenía alertas simultáneas para correo y contraseña; se refinó la consulta a `getByText(/formato de correo electrónico válido/i)` permitiendo que el 100% de los tests pasaran (8/8).
