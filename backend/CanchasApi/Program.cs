using CanchasApi.Endpoints;
using CanchasApi.Middleware;
using CanchasApi.Models;
using CanchasApi.Repositories;
using CanchasApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
//cargamos todo lo referente los jwt
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Falta configurar 'Jwt:Key'. Definela con dotnet user-secrets (ver README) o como variable de entorno; nunca hardcodeada en el código.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudince = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudince,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey))

            };
        });
builder.Services.AddAuthorization();

// 1. CORS restringido a orígenes explícitos (Frontend Vite y puertos de desarrollo)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// 2. Rate Limiting para mitigar ataques de fuerza bruta (OWASP API4)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("LoginLimiter", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// conexión a la db
builder.Services.AddDbContext<ReservasCanchasDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("miconexion")));
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
//invocamos la clase de autenticación 
builder.Services.AddScoped<AuthService>();

// Patrón Repository: repositorio genérico para cualquier entidad,
// y repositorios específicos cuando la entidad necesita consultas propias.
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

var app = builder.Build();

app.UseRequestLogging(); // middleware propio: registra método, ruta, status y duración

// 3. Cabeceras HTTP de seguridad (OWASP API8 Security Misconfiguration)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});

app.UseCors("FrontendPolicy");
app.UseRateLimiter();

app.UseAuthentication(); // ¿quién es?
app.UseAuthorization(); // ¿qué puede hacer?
// Endpoint para comprobar conexión a la base de datos
app.MapGet("/health", async (ReservasCanchasDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        if (canConnect)
            return Results.Ok(new { database = "connected" });
        return Results.StatusCode(503);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 503);
    }
});
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// Creación de EndPoints
app.MapUsuarioApi();
app.MapTrabajadorApi();
app.MapSedeApi();
app.MapTipoCanchaApi();
app.MapCanchaApi();
app.MapHorarioApi();
app.MapReservaApi();
app.MapPagoApi();
app.MapComprobanteApi();
app.MapResenaApi();
app.MapMantenimientoApi();
// Semilla de base de datos en desarrollo
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ReservasCanchasDbContext>();
    var auth = scope.ServiceProvider.GetRequiredService<AuthService>();
    try
    {
        await CanchasApi.Data.DbInitializer.SeedAsync(db, auth);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "No se pudo sembrar la base de datos automáticamente.");
    }
}

app.Run();

// Necesario para que WebApplicationFactory<Program> (proyecto de pruebas de integración)
// pueda referenciar esta clase Program generada por los top-level statements.
public partial class Program { }
