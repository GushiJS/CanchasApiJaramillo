# Informe Técnico: Arquitectura, Seguridad y Accesibilidad Frontend

**Asignatura:** Lenguaje Programación Web II  
**Evaluación:** Evaluación 2 (Trabajo 2: Frontend, consumo de API y seguridad)  
**Estudiante:** Gustavo Jaramillo  
**Docente:** Enso Guidotti  
**Institución:** Instituto Profesional Virginio Gómez  
**Fecha:** Octubre 2026  

---

## 1. Decisiones de Diseño y Arquitectura

### 1.1 Framework y Herramienta de Construcción
* **Tecnología:** React 19 con **TypeScript** y **Vite**.
* **Justificación:** Vite ofrece arranque ultrarrápido (HMR mediante ESM nativo), optimizaciones de bundle con Rollup/Rolldown, tipado estricto que reduce errores en tiempo de ejecución y una configuración minimalista sin la sobrecarga de herramientas monolíticas.

### 1.2 Estructura del Proyecto (Monorepo)
* **Organización:**
  * `backend/`: API RESTful en ASP.NET Core Minimal APIs (.NET 10) con Entity Framework Core y SQL Server (`DESKTOP-BTUPOMU\SQLEXPRESS`).
  * `frontend/`: Aplicación SPA modular organizada por capas de responsabilidad:
    * `src/components/`: Componentes accesibles reutilizables (Navbar, Footer, ConfirmModal, Alert).
    * `src/context/`: `AuthContext` para el estado global de sesión y rol de usuario.
    * `src/lib/`: Cliente HTTP Axios centralizado con interceptores.
    * `src/pages/`: Vistas de la aplicación (Home, Login, CanchasList, CanchaDetail, CanchaForm, Forbidden, NotFound).
    * `src/routes/`: Guardias de navegación (`ProtectedRoute` y `RoleGuard`).
    * `src/schemas/`: Esquemas de validación en cliente con Zod.
    * `src/services/`: Capa desacoplada de consumo HTTP (`authService`, `canchasService`, `sedesService`, `tipoCanchasService`).
    * `src/types/`: Interfaces y contratos DTOs tipados.

### 1.3 Manejo de Estado Asíncrono
* **Librería:** **TanStack Query (React Query v5)**.
* **Justificación:** Automatiza la gestión de estados asíncronos complejos (carga, éxito, error, reintentos), almacena datos en caché evitando peticiones redundantes (`staleTime`), sincroniza automáticamente la UI tras mutaciones (`invalidateQueries`) y desacopla la sincronización del servidor del estado local de los componentes.

### 1.4 Estrategia de Almacenamiento del Token JWT
* **Estrategia Elegida:** `sessionStorage` sincronizado con el estado reactivo de React (`AuthContext`).
* **Justificación de Seguridad:**
  * A diferencia de `localStorage`, `sessionStorage` se destruye inmediatamente al cerrar la pestaña o ventana del navegador, impidiendo accesos no autorizados en equipos compartidos.
  * Frente a cookies estándar, el envío como cabecera `Authorization: Bearer <token>` mitiga por diseño ataques de Cross-Site Request Forgery (CSRF), ya que el navegador no adjunta automáticamente las cabeceras personalizadas en peticiones cross-origin no solicitadas.
  * El token se mantiene aislado, nunca se expone en parámetros de URL y el cliente Axios intercepta y elimina el token en caso de recibir respuestas `401 Unauthorized`.

### 1.5 Accesibilidad (WCAG 2.2 Nivel AA)
* **HTML Semántico y Landmarks:** Uso estricto de `<header>`, `<nav>`, `<main id="main-content">`, `<section>`, `<article>` y `<footer role="contentinfo">`.
* **Jerarquía de Encabezados:** Estructura ordenada con un único `<h1>` por vista.
* **Formularios Accesibles:** Todos los campos cuentan con `<label htmlFor="...">` explícito, vinculación de errores mediante `aria-describedby` y anuncios reactivos a lectores de pantalla vía `aria-live="polite"` o `role="alert"`.
* **Navegación por Teclado:** Foco visible evidente (`outline: 3px solid #0284c7; outline-offset: 2px;`), enlace de salto al contenido (`.skip-link`) y focus-trap accesible en el modal de confirmación con soporte para la tecla `Escape`.
* **Contraste de Color:** Paleta validada con ratio superior a 4.5:1 en textos normales y 3:1 en componentes gráficos.
* **Independencia del Color:** Los estados de las canchas combinan color, forma, íconos SVG y texto legible.

### 1.6 Diseño Responsivo Mobile-First
* **Adaptabilidad:** Maquetación fluida con Flexbox y CSS Grid desde 320 px de ancho sin desbordamiento ni scroll horizontal.
* **Transformación Adaptativa de Datos:** En escritorio (&ge; 769 px) los datos se muestran en tabla accesible; en dispositivos móviles (&le; 768 px) se transforman automáticamente en tarjetas apiladas.
* **Controles Táctiles:** Cumplimiento de WCAG 2.5.8 con botones e inputs de tamaño táctil mínimo de 44 &times; 44 px.
* **Zoom:** Soporte completo de ampliación de texto hasta el 200% sin ruptura del diseño.

---

## 2. Matriz de Riesgos de Seguridad Mitigados (OWASP)

| # | Riesgo | Referencia OWASP | Lado | Dónde Aparecía en la Aplicación | Mitigación Implementada en Código | Evidencia Verificable |
|---|---|---|---|---|---|---|
| **1** | **Cross-Site Scripting (XSS)** | OWASP Top 10 Web: Injection | **Cliente** | Renderizado de textos y nombres dinámicos en vistas y formularios | React escapa automáticamente los valores en JSX; cero uso de `dangerouslySetInnerHTML`. Cabecera `X-XSS-Protection: 1; mode=block` en backend. | Inyección de `<script>alert('XSS')</script>` en nombres de canchas; el navegador lo renderiza como texto inofensivo. |
| **2** | **Robo o filtración del token** | OWASP API2:2023 Broken Authentication | **Cliente** | Almacenamiento en navegador y envío HTTP | Almacenamiento en `sessionStorage` (destruido al cerrar pestaña), envío exclusivo como `Bearer` en cabecera HTTP, interceptor que limpia el token en `401`, cero tokens en URLs o `console.log`. | Inspección de URLs, `sessionStorage` limpio tras logout y redirección forzada a `/login`. |
| **3** | **Consumo inseguro de respuestas de la API** | OWASP API10:2023 Unsafe Consumption of APIs | **Cliente** | Respuestas de servicios `canchasService.ts` y consumo en componentes | Tipado estricto con TypeScript, validación de inputs con esquemas Zod (`canchaSchema`), sanitización y renderizado exclusivo como nodos de texto. | Datos con tipos no compatibles son rechazados por la capa de servicio y tipado antes de montarse al DOM. |
| **4** | **Dependencias vulnerables** | OWASP Top 10 Web: Vulnerable and Outdated Components | **Cliente** | Módulos de terceros en `package.json` | Auditoría de seguridad con `npm audit`, versionamiento de `package-lock.json` y dependencias actualizadas. | Ejecución de `npm audit` reporta **0 vulnerabilidades**. |
| **5** | **Fuerza bruta y consumo sin límites** | OWASP API4:2023 Unrestricted Resource Consumption | **Ambos** | Endpoint crítico `POST /api/v1/usuarios/login` | Rate Limiter de ASP.NET Core (`AddFixedWindowLimiter`) configurado para máximo 5 peticiones/minuto por IP. En frontend, captura del código HTTP `429` con alerta temporal de bloqueo. | Enviar más de 5 intentos fallidos consecutivos de login; la API responde `429 Too Many Requests` y el frontend bloquea el formulario. |
| **6** | **Control de acceso roto a nivel de función** | OWASP API5:2023 Broken Function Level Authorization | **Ambos** | Operaciones administrativas de creación, edición y eliminación de canchas | En frontend: `RoleGuard` restringe rutas `/canchas/nueva` y `/canchas/:id/editar` solo al rol `Administrador`, y oculta botones. En backend: validación obligatoria con `RequireRole("Administrador")`. | Si un usuario con rol `Cliente` intenta acceder por URL o envía un `DELETE` por Postman, recibe `403 Forbidden`. |
| **7** | **Configuración de seguridad incorrecta (CORS y Cabeceras)** | OWASP API8:2023 Security Misconfiguration | **API** | `Program.cs` del backend .NET | Política CORS restringida con `WithOrigins("http://localhost:5173")` (sin orígenes comodín `*` con credenciales). Middleware inyecta `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. | Peticiones desde un origen no autorizado (`http://malicioso.com`) son bloqueadas por el navegador debido a la política CORS. |

---

## 3. Resumen de Pruebas Automatizadas

* **Backend (`CanchasApi.Tests`):**
  * 7 de 7 pruebas de integración ejecutadas y aprobadas exitosamente (`dotnet test`).
  * Cobertura: Verificación de salud `/health`, registro con datos válidos, validación de contraseñas obligatorias, rechazo de correos duplicados (409 Conflict), autenticación exitosa con JWT y rechazo de credenciales inválidas (401 Unauthorized).
* **Frontend (`Vitest + Testing Library`):**
  * 8 de 8 pruebas de componentes ejecutadas y aprobadas exitosamente (`npm run test`).
  * Cobertura:
    * `Login.test.tsx`: Renderizado accesible, validación Zod de formato de correo en cliente, llamada a API y guardado de token en `sessionStorage`.
    * `ProtectedRoute.test.tsx`: Redirección automática de usuarios anónimos a `/login`, acceso a usuarios autenticados, y redirección a `/403` ante roles no autorizados.
    * `CanchasList.test.tsx`: Renderizado de listado con API simulada, verificación de badges de estado y manejo de estado vacío (*Empty State*).
