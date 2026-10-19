using CanchasApi.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CanchasApi.Tests
{
    /// <summary>
    /// WebApplicationFactory que arranca la API completa en memoria para los tests
    /// de integración, reemplazando SQL Server por un DbContext InMemory y
    /// definiendo una Jwt:Key de prueba (Program.cs exige que exista para arrancar).
    /// </summary>
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        static CustomWebApplicationFactory()
        {
            Environment.SetEnvironmentVariable("Jwt__Key", "clave-de-pruebas-solo-para-tests-de-integracion-1234567890");
            Environment.SetEnvironmentVariable("Jwt__Issuer", "CanchasApi.Tests");
            Environment.SetEnvironmentVariable("Jwt__Audience", "CanchasApi.Tests");
        }

        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((context, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "clave-de-pruebas-solo-para-tests-de-integracion-1234567890",
                    ["Jwt:Issuer"] = "CanchasApi.Tests",
                    ["Jwt:Audience"] = "CanchasApi.Tests"
                });
            });

            builder.ConfigureServices(services =>
            {
                var descriptors = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<ReservasCanchasDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType == typeof(ReservasCanchasDbContext)).ToList();
                foreach (var descriptor in descriptors)
                    services.Remove(descriptor);

                var inMemoryServiceProvider = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                services.AddDbContext<ReservasCanchasDbContext>(options =>
                {
                    options.UseInMemoryDatabase("CanchasApiTestsDb");
                    options.UseInternalServiceProvider(inMemoryServiceProvider);
                });
            });
        }
    }
}
