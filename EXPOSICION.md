# Guión de Exposición y Demostración en Vivo (15 Puntos)

**Asignatura:** Lenguaje Programación Web II  
**Evaluación 2:** Frontend, consumo de API y seguridad  
**Estudiante:** Gustavo Jaramillo  
**Docente:** Enso Guidotti  
**Institución:** Instituto Profesional Virginio Gómez  

---

## ⏱️ Estructura Temporal de la Presentación (10 a 12 Minutos)

```text
[00:00 - 02:00] 1. Introducción y Arquitectura General
[02:00 - 04:30] 2. Demostración en Vivo: Autenticación, Roles y CRUD
[04:30 - 07:30] 3. Demostración de Medidas de Seguridad OWASP (Pruebas de Bloqueo)
[07:30 - 09:30] 4. Demostración de Accesibilidad WCAG 2.2 AA y Diseño Responsivo
[09:30 - 11:00] 5. Pruebas Automatizadas y Bitácora de Inteligencia Artificial
[11:00 - Final] 6. Preguntas y Respuestas del Docente
```

---

## 1. Introducción y Arquitectura (2 min)

* **Propósito del Proyecto:** Explicar que la aplicación es una solución integrada fullstack para la gestión de canchas deportivas, consumiendo la API de ASP.NET Core (.NET 10) desde una SPA construida con **React 19, TypeScript y Vite**.
* **Arquitectura Monorepo:**
  * Mostrar la carpeta `backend/` con Minimal APIs, Entity Framework Core, SQL Server y `CanchasApi.Tests`.
  * Mostrar la carpeta `frontend/` con capas desacopladas: cliente Axios centralizado, manejo de estado asíncrono con **TanStack Query (React Query)**, validaciones con **Zod** y diseño modular por componentes.
* **Variables de Entorno y Secretos:**
  * Mostrar que los secretos reales (`Jwt:Key`, Connection Strings) se manejan con `dotnet user-secrets` y variables de entorno, dejando solo `.env.example` en el repositorio para evitar fugas de credenciales (OWASP API8).

---

## 2. Demostración en Vivo: Flujo de Usuario y CRUD (2.5 min)

1. **Iniciar Sesión:**
   * Abrir `http://localhost:5173/login`.
   * Usar el botón de acceso rápido **Admin (Full)** (`admin@canchas.com` / `Admin123!`).
   * Mostrar cómo el interceptor de Axios recibe el JWT y lo almacena de forma segura en `sessionStorage`, actualizando el badge del Navbar a **"Administrador General (Administrador)"**.
2. **Listar y Filtrar Canchas:**
   * Navegar a `/canchas`.
   * Demostrar el filtrado reactivo por Sede (Sede Central, Sede San Pedro) y Tipo de Cancha (Fútbol 7, Pádel, Tenis).
   * Mostrar el buscador por texto y el botón "Limpiar Filtros".
3. **Detalle de Recurso:**
   * Hacer clic en "Ver" en una cancha para mostrar la vista `/canchas/:id`.
   * Explicar cómo se presentan los datos del recurso relacionado (Sede y Superficie) y la tarifa por hora.
4. **Creación y Edición:**
   * Hacer clic en "Registrar Nueva Cancha" (`/canchas/nueva`).
   * Probar validación en cliente: intentar guardar con campos vacíos y mostrar los mensajes de error en vivo generados por Zod.
   * Crear la cancha con éxito y verificar que TanStack Query invalida la caché y la muestra inmediatamente en la tabla.
5. **Eliminación con Modal Accesible:**
   * Hacer clic en "Eliminar" en una cancha creada.
   * Mostrar el diálogo modal accesible (`ConfirmModal.tsx`), presionar la tecla `Escape` para cerrarlo sin borrar, abrirlo de nuevo y confirmar la eliminación.

---

## 3. Demostración de Seguridad: Pruebas de Bloqueo (3 min)

> **Punto Crítico para la Nota:** El docente evaluará que los controles realmente funcionen ante accesos o entradas indebidas.

### Control 1: Acceso sin Token (401 Unauthorized)
* **Demostración:** Abrir una ventana de incógnito (o abrir Postman/Terminal) y realizar una petición `POST /api/v1/canchas` sin cabecera `Authorization`.
* **Resultado:** La API rechaza inmediatamente la solicitud con código HTTP **`401 Unauthorized`**.
* En el frontend: Si un usuario sin sesión intenta entrar a `/canchas/nueva`, el guardia `<ProtectedRoute>` lo intercepta y lo expulsa automáticamente a `/login`.

### Control 2: Rol Insuficiente (403 Forbidden - OWASP API5)
* **Demostración:**
  1. Cerrar sesión e ingresar con el perfil **Cliente (Básico)** (`cliente@canchas.com` / `Cliente123!`).
  2. Mostrar que en el Navbar **no existe** el botón "Nueva Cancha", ni tampoco los botones "Editar" o "Eliminar" en la tabla.
  3. Forzar el ingreso escribiendo manualmente en la barra de direcciones: `http://localhost:5173/canchas/nueva`.
* **Resultado:** El componente `<RoleGuard>` detecta que el usuario no tiene rol `Administrador` y redirige a la vista **`/403 — Acceso Denegado`**.
* **Prueba en Backend:** Mostrar en consola o Postman que si el cliente envía un `DELETE /api/v1/canchas/1` con su token de Cliente, el backend responde **`403 Forbidden`**.

### Control 3: Intento de Inyección de Script (XSS - OWASP Top 10 Injection)
* **Demostración:** En el formulario de nueva cancha, intentar ingresar en el número o seleccionar una sede adulterada con `<script>alert('XSS Atacado')</script>`.
* **Resultado:** React y el motor JSX escapan todas las cadenas a nodos de texto seguro en el DOM. Cero ejecución de scripts maliciosos.

### Control 4: Origen no Permitido (CORS - OWASP API8)
* **Demostración:** Mostrar en [`Program.cs`](file:///c:/Users/usuario/Downloads/CanchasApi26-08%20%281%29/backend/CanchasApi/Program.cs) la política `WithOrigins("http://localhost:5173")`.
* Explicar que si una web externa intenta realizar peticiones fetch desde otro dominio no autorizado, el navegador bloquea la lectura por política CORS.

### Control 5: Límite de Tasa / Fuerza Bruta (Rate Limiting - OWASP API4)
* **Demostración:** En el formulario de login, presionar repetidamente el botón de envío con contraseñas erróneas más de 5 veces en un minuto.
* **Resultado:** La API responde código HTTP **`429 Too Many Requests`** y el frontend muestra la alerta roja informando: *"Límite de intentos excedido (Rate Limit). Espere un minuto antes de volver a intentar"*.

---

## 4. Accesibilidad WCAG 2.2 AA y Diseño Responsivo (2 min)

### Accesibilidad con Teclado
* **Demostración:** Dejar el ratón sobre la mesa y navegar **únicamente con el teclado**:
  1. Presionar `Tab` al inicio de la página para revelar el enlace accesible: **"Saltar al contenido principal"** (`.skip-link`).
  2. Tabular a través de los enlaces del Navbar y los filtros de la tabla.
  3. Mostrar el **foco visible azul** (`outline: 3px solid #0284c7`) que cumple con el contraste no textual de WCAG 2.2.
  4. Abrir el modal de eliminación con `Enter`, demostrar que el foco queda atrapado dentro del modal (Focus Trap) y cerrarlo con la tecla `Escape`.

### Diseño Responsivo Mobile-First
* **Demostración:** Abrir las Herramientas de Desarrollador de Chrome (`F12`), activar el emulador de dispositivos móviles y fijar el ancho en **360 px** (viewport móvil):
  1. Mostrar que la tabla de escritorio se transforma fluidamente en **tarjetas verticales independientes**.
  2. Comprobar que no existe ningún desbordamiento ni barra de desplazamiento horizontal.
  3. Evidenciar que los botones y enlaces cumplen con el área táctil mínima de **44 &times; 44 px** para interacción táctil cómoda.
  4. Realizar zoom de texto al **200%** para demostrar la reorganización automática del texto sin pérdida de legibilidad.

---

## 5. Pruebas Automatizadas y Bitácora de IA (1.5 min)

* **Pruebas del Backend:**
  * Mostrar la terminal ejecutando `dotnet test`:
    ```bash
    dotnet test CanchasApi.Tests
    # Resultado: Correctas! Con error: 0, Superado: 7, Total: 7
    ```
* **Pruebas del Frontend:**
  * Mostrar la terminal ejecutando Vitest:
    ```bash
    npm run test
    # Resultado: Test Files 3 passed (3), Tests 8 passed (8)
    ```
* **Auditoría de Dependencias:**
  * Mostrar el reporte de seguridad:
    ```bash
    npm audit
    # Resultado: found 0 vulnerabilities
    ```
* **Declaración de IA:**
  * Mostrar el archivo [`AI_LOG.md`](file:///c:/Users/usuario/Downloads/CanchasApi26-08%20%281%29/AI_LOG.md) con la declaración formal del modelo Gemini 3.8 Flash, los prompts utilizados y la explicación de cómo se resolvieron los conflictos de proveedores en EF Core y el tipado de TypeScript.

---

## 6. Respuestas a Preguntas Frecuentes del Docente

* **¿Por qué guardaron el token en `sessionStorage` y no en `localStorage` ni en cookies?**
  * *Respuesta:* `sessionStorage` tiene la ventaja de aislar la sesión a la pestaña activa: si el usuario cierra el navegador en un computador público, la sesión queda destruida inmediatamente. Además, al enviarlo como cabecera `Authorization: Bearer`, neutralizamos los ataques de CSRF que aprovechan las cookies automáticas del navegador.
* **¿Qué pasa si un usuario malicioso burla el frontend y altera el DOM para ver los botones de administrador?**
  * *Respuesta:* La interfaz gráfica solo actúa como una capa de experiencia de usuario. El backend de .NET valida de forma obligatoria el claim de rol (`RequireRole("Administrador")`) en cada endpoint mediante middleware de autenticación y autorización. Cualquier intento de ejecutar `POST`, `PUT` o `DELETE` sin token de Administrador será rechazado en el servidor con `403 Forbidden`.
* **¿Cómo garantizan el cumplimiento de accesibilidad WCAG?**
  * *Respuesta:* Aplicamos HTML5 semántico en landmarks (`<main>`, `<nav>`, `<header>`), asociación estricta entre etiquetas `<label>` e `<input>`, mensajes de error vinculados con `aria-describedby` y leídos por lectores de pantalla mediante `aria-live`, navegación por teclado con foco visible, contraste de colores mayor a 4.5:1 y controles táctiles de al menos 44×44px.
