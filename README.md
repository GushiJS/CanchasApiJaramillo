# CanchasApiJaramillo — Sistema Integral de Reserva de Canchas

Proyecto fullstack desarrollado para la asignatura **Lenguaje Programación Web II (Evaluación 2)** — *Instituto Profesional Virginio Gómez*.
Consta de una API RESTful construida en **ASP.NET Core (.NET 10)** y una aplicación cliente SPA desarrollada con **React 19 + TypeScript + Vite**, con arquitectura limpia, autenticación JWT, autorización basada en roles (RBAC), accesibilidad **WCAG 2.2 nivel AA**, diseño mobile-first y mitigación de riesgos de seguridad **OWASP Top 10**.

---

## 🏗️ Arquitectura del Monorepo

```text
CanchasApiJaramillo/
├── backend/                  # API RESTful en ASP.NET Core Minimal APIs (.NET 10)
│   ├── CanchasApi/           # Proyecto principal (Endpoints, Models, Repositories, Services)
│   ├── CanchasApi.Tests/     # Suite de pruebas de integración con xUnit y WebApplicationFactory
│   ├── CanchasApi.slnx       # Solución .NET
│   └── .env.example          # Variables de entorno de referencia para backend
├── frontend/                 # Aplicación SPA en React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Componentes reutilizables accesibles (Navbar, Modal, Inputs)
│   │   ├── context/          # Contexto global de Autenticación y Autorización
│   │   ├── lib/              # Cliente Axios centralizado con interceptores JWT
│   │   ├── pages/            # Vistas (Login, CanchasList, CanchaDetail, CanchaForm, Forbidden, NotFound)
│   │   ├── routes/           # ProtectedRoute y RoleGuard
│   │   ├── schemas/          # Validación cliente con Zod
│   │   ├── services/         # Capa de consumo HTTP desacoplada
│   │   ├── test/             # Pruebas automatizadas con Vitest y React Testing Library
│   │   └── types/            # Contratos DTOs e interfaces TypeScript
│   ├── .env.example          # Variables de entorno de referencia para frontend
│   └── package.json
├── docs/                     # Evidencias de pruebas, accesibilidad y capturas
├── AI_LOG.md                 # Bitácora de uso de Inteligencia Artificial Generativa
├── INFORME_TECNICO.md        # Informe técnico de decisiones y matriz de riesgos OWASP
└── .gitignore                # Reglas de exclusión para .NET y Node
```

---

## 🚀 Requisitos Previos

* **.NET SDK 10.0+**
* **Node.js v20+** (recomendado v22 o v25) y **npm 10+**
* **SQL Server** (LocalDB o instancia SQLEXPRESS)

---

## ⚙️ Paso a Paso: Instalación y Ejecución

### 1. Configurar y Ejecutar el Backend (.NET API)

1. Navegar a la carpeta del backend:
   ```bash
   cd backend/CanchasApi
   ```

2. Configurar la cadena de conexión y la clave JWT mediante `dotnet user-secrets`:
   ```bash
   # Configurar conexión a SQL Server (ejemplo para SQLEXPRESS local):
   dotnet user-secrets set "ConnectionStrings:miconexion" "Server=DESKTOP-BTUPOMU\SQLEXPRESS;Initial Catalog=ReservasCanchasDB;Integrated Security=True;Encrypt=False;TrustServerCertificate=True"

   # Configurar clave JWT secreta (mínimo 32 caracteres):
   dotnet user-secrets set "Jwt:Key" "CanchasApi_JWT_SecretKey_Desarrollo_Local_2026_UltraSegura_TokenFirmado!"
   ```

3. Aplicar las migraciones a la base de datos:
   ```bash
   dotnet ef database update
   ```

4. Ejecutar la API:
   ```bash
   dotnet run --launch-profile http
   ```
   * **URL de la API:** `http://localhost:5098`
   * **Documentación interactiva Scalar:** `http://localhost:5098/scalar/v1`
   * **Comprobación de Salud (Health):** `http://localhost:5098/health`

### 2. Configurar y Ejecutar el Frontend (React + Vite)

1. En una nueva terminal, ingresar a la carpeta frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Verificar que el archivo `.env` apunte a la API:
   ```env
   VITE_API_BASE_URL="http://localhost:5098"
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   * **Aplicación Web:** `http://localhost:5173`

---

## 👥 Credenciales de Prueba (Semilla Automática)

Al iniciar el backend, se sembrarán automáticamente usuarios de prueba para evaluar la autorización:

| Rol | Correo Electrónico | Contraseña | Permisos |
|---|---|---|---|
| **Administrador** | `admin@canchas.com` | `Admin123!` | CRUD completo de Canchas, Gestión y vista global |
| **Cliente** | `cliente@canchas.com` | `Cliente123!` | Consulta de canchas disponibles, vista de usuario |

---

## 🧪 Ejecución de Pruebas Automatizadas

* **Pruebas del Backend (xUnit + WebApplicationFactory):**
  ```bash
  cd backend
  dotnet test CanchasApi.Tests
  ```

* **Pruebas del Frontend (Vitest + React Testing Library):**
  ```bash
  cd frontend
  npm run test
  ```

---

## 🛡️ Seguridad Implementada (OWASP)

1. **CORS Explícito:** Restringido a `http://localhost:5173` y `http://localhost:3000`.
2. **Rate Limiting:** Límite de tasa (máx 5 peticiones/minuto) en el endpoint `/api/v1/usuarios/login` (código HTTP `429`).
3. **Cabeceras HTTP de Seguridad:** Inyección de `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
4. **Protección XSS:** Renderizado React seguro, sanitización y cero uso de `dangerouslySetInnerHTML`.
5. **Autenticación JWT:** Token Bearer seguro en `sessionStorage` con logout que limpia almacenamiento y caché.
6. **Autorización RBAC:** Rutas protegidas (`ProtectedRoute`, `RoleGuard`) y respuesta `403 Forbidden` forzada en backend ante roles insuficientes.
