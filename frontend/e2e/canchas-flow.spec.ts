import { test, expect } from '@playwright/test';

test.describe('Flujo End-to-End: Login, Crear Cancha y Listar', () => {
  test('debe permitir autenticarse como Administrador, registrar una nueva cancha y verificar su presencia en el listado', async ({ page }) => {
    // 1. Navegar a la página de inicio de sesión
    await page.goto('/login');
    await expect(page).toHaveTitle(/CanchasApp/);
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

    // 2. Ingresar credenciales del Administrador
    await page.fill('#login-email', 'admin@canchas.com');
    await page.fill('#login-password', 'Admin123!');
    await page.click('button[type="submit"]');

    // 3. Verificar redirección exitosa al listado de canchas
    await expect(page).toHaveURL(/\/canchas/);
    await expect(page.getByRole('heading', { name: /listado de canchas deportivas/i })).toBeVisible();

    // 4. Iniciar creación de nueva cancha mediante botón protegido de Administrador
    const btnNueva = page.getByRole('link', { name: /registrar nueva cancha/i });
    await expect(btnNueva).toBeVisible();
    await btnNueva.click();

    // 5. Verificar que se cargó el formulario en /canchas/nueva
    await expect(page).toHaveURL(/\/canchas\/nueva/);
    await expect(page.getByRole('heading', { name: /registrar nueva cancha/i })).toBeVisible();

    // 6. Llenar los campos del formulario con validaciones
    const numeroCanchaUnico = Math.floor(100 + Math.random() * 899); // Genera número aleatorio entre 100 y 999
    await page.fill('#numero', numeroCanchaUnico.toString());

    // Seleccionar sede y tipo de superficie en los selectores relacionados
    await page.selectOption('#sedeId', { index: 1 });
    await page.selectOption('#tipoCanchaId', { index: 1 });
    await page.selectOption('#estado', 'Disponible');

    // 7. Enviar formulario
    await page.click('button[type="submit"]');

    // 8. Verificar que redirige automáticamente a /canchas y la nueva cancha aparece listada
    await expect(page).toHaveURL(/\/canchas/);
    await expect(page.getByText(`Cancha #${numeroCanchaUnico}`)).toBeVisible({ timeout: 10000 });
  });
});
