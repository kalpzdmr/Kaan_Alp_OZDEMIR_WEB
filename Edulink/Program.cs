using Edulink;
using Edulink.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Kestrel portlarını sabitle
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5130); // HTTP
    options.ListenLocalhost(7299, listenOptions => listenOptions.UseHttps()); // HTTPS
});

// 🔹 PostgreSQL bağlantısı
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
        policy
            .WithOrigins("http://localhost:3000", "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// 🔹 JWT Ayarları
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT key not configured.");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true
    };
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🔹 Middleware sırası
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowClient");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


// -------------------------------------------------------------
// ✅ UYGULAMA AÇILIRKEN DERSLERİ OTOMATİK EKLE (SEED DATA)
// -------------------------------------------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (!db.Courses.Any())
    {
        db.Courses.AddRange(new List<Course>
        {
            new Course { Name = "Türkçe", Description = "Türkçe dersi" },
            new Course { Name = "Matematik", Description = "Matematik dersi" },
            new Course { Name = "Fen Bilgisi", Description = "Fen bilgisi dersi" },
            new Course { Name = "İngilizce", Description = "İngilizce dersi" },
            new Course { Name = "Din Kültürü", Description = "Din Kültürü dersi" },
            new Course { Name = "İnkılap", Description = "İnkılap dersi" },
            new Course { Name = "Fizik", Description = "Fizik dersi" },
            new Course { Name = "Kimya", Description = "Kimya dersi" }
        });

        db.SaveChanges();
        Console.WriteLine("📌 Dersler otomatik eklendi.");
    }
}

app.Run();
