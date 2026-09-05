using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Backend.Data;
using Backend.Data.Seeds;
using Backend.Middlewares;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// 1. DATABASE CONFIGURATION (PostgreSQL EF Core)
// ============================================================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=satisfaction_db;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ============================================================================
// 2. DEPENDENCY INJECTION (Services Registration)
// ============================================================================
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IScopeFilterService, ScopeFilterService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// ============================================================================
// 3. JWT AUTHENTICATION & SECURITY
// ============================================================================
var secretKey = builder.Configuration["JwtSettings:SecretKey"] 
    ?? "SuperSecretSecurityKeyForEnterpriseCsatSatisfactionPlatform2026!";
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "SatisfactionApi";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "SatisfactionClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // ปิดสำหรับโหมด Development Localhost
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero // หมดอายุทันทีตามเวลา ไม่เผื่อเวลาดีเลย์
    };
});

builder.Services.AddAuthorization();

// ============================================================================
// 4. CORS CONFIGURATION (รองรับ Next.js Frontend)
// ============================================================================
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();

// ============================================================================
// 5. SWAGGER / OPENAPI (พร้อมปุ่ม Authorize กรอก JWT Bearer Token)
// ============================================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Enterprise CSAT Platform API",
        Version = "v1",
        Description = "API สำหรับระบบประเมินความพึงพอใจลูกค้าและวิเคราะห์ข้อมูล 5 ระดับ (Central Restaurants Group)"
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", null),
            new List<string>()
        }
    });
});

var app = builder.Build();

// ============================================================================
// 6. HTTP REQUEST PIPELINE (Middleware Order สำคัญมาก)
// ============================================================================

// 1. ดักจับ Error กลาง
app.UseMiddleware<ExceptionHandlingMiddleware>();

// 2. Swagger UI สำหรับทดสอบ API
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Enterprise CSAT API v1");
        c.RoutePrefix = "swagger"; // เข้าทดสอบที่ http://localhost:5000/swagger
    });
}

// 3. ปลดล็อก CORS ให้ Frontend Next.js เรียกใช้งานได้
app.UseCors("AllowFrontend");

// 4. ตรวจสอบบัตรผ่านและสิทธิ์
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ============================================================================
// 7. AUTO-MIGRATION & INITIAL SEED DATA
// ============================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        await DbInitializer.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "⚠️ ไม่สามารถเชื่อมต่อ Database หรือ Seeding Data ได้ในขณะนี้ (ตรวจสอบ PostgreSQL service)");
    }
}

app.Run();
