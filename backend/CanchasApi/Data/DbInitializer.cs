using CanchasApi.Models;
using CanchasApi.Services;

namespace CanchasApi.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(ReservasCanchasDbContext db, AuthService auth)
        {
            // 1. Usuarios semilla (Admin y Cliente)
            if (!db.Usuarios.Any())
            {
                var admin = new Usuario
                {
                    Nombre = "Administrador General",
                    Email = "admin@canchas.com",
                    Rol = "Administrador",
                    FechaCreacion = DateTime.UtcNow
                };
                admin.PasswordHash = auth.HashPassword(admin, "Admin123!");
                db.Usuarios.Add(admin);

                var cliente = new Usuario
                {
                    Nombre = "Cliente Juan Pérez",
                    Email = "cliente@canchas.com",
                    Rol = "Cliente",
                    FechaCreacion = DateTime.UtcNow
                };
                cliente.PasswordHash = auth.HashPassword(cliente, "Cliente123!");
                db.Usuarios.Add(cliente);

                await db.SaveChangesAsync();
            }

            // 2. Sedes semilla
            if (!db.Sedes.Any())
            {
                var sedeCentral = new Sede { Nombre = "Sede Central Concepción", Direccion = "Av. Paicaví 1234, Concepción", Telefono = "+56911223344" };
                var sedeNorte = new Sede { Nombre = "Sede San Pedro", Direccion = "Calle Los Robles 567, San Pedro de la Paz", Telefono = "+56955667788" };
                db.Sedes.AddRange(sedeCentral, sedeNorte);
                await db.SaveChangesAsync();
            }

            // 3. Tipos de Cancha semilla
            if (!db.TiposCancha.Any())
            {
                var futbol = new TipoCancha { Nombre = "Fútbol 7", Descripcion = "Césped sintético FIFA con iluminación LED", PrecioPorHora = 25000 };
                var padel = new TipoCancha { Nombre = "Pádel Panorámica", Descripcion = "Cancha de cristal templado techada", PrecioPorHora = 18000 };
                var tenis = new TipoCancha { Nombre = "Tenis Arcilla", Descripcion = "Superficie de polvo de ladrillo reglamentaria", PrecioPorHora = 15000 };
                db.TiposCancha.AddRange(futbol, padel, tenis);
                await db.SaveChangesAsync();
            }

            // 4. Canchas semilla
            if (!db.Canchas.Any())
            {
                var sede = db.Sedes.First();
                var tipos = db.TiposCancha.ToList();

                db.Canchas.AddRange(
                    new Cancha { Numero = 1, SedeId = sede.Id, TipoCanchaId = tipos[0].Id, Estado = "Disponible" },
                    new Cancha { Numero = 2, SedeId = sede.Id, TipoCanchaId = tipos.Count > 1 ? tipos[1].Id : tipos[0].Id, Estado = "Disponible" },
                    new Cancha { Numero = 3, SedeId = sede.Id, TipoCanchaId = tipos.Count > 2 ? tipos[2].Id : tipos[0].Id, Estado = "Mantenimiento" }
                );
                await db.SaveChangesAsync();
            }
        }
    }
}
