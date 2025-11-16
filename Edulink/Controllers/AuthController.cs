using Edulink;
using Edulink.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Edulink.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // 🔹 1️⃣ Kayıt Ol
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Geçersiz kullanıcı verisi!" });

            if (string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Ad, e-posta ve şifre zorunludur!" });
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Bu e-posta zaten kayıtlı!" });

            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = request.Password,
                Role = request.Role?.ToLower() ?? "öğrenci"  // ✅ Rol küçük harf
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // 🔹 Kayıt sonrası ilişki oluşturma
            await CreateParentStudentLinksAsync(newUser);

            return Ok(new { message = "Kayıt başarılı!" });
        }

        // 🔹 2️⃣ Giriş Yap
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Geçersiz istek!" });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

            if (user == null)
                return Unauthorized(new { message = "E-posta veya şifre hatalı!" });

            // ✅ JWT key'i güvenli biçimde al
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
                return StatusCode(500, new { message = "JWT key bulunamadı! appsettings.json kontrol et." });

            var key = Encoding.ASCII.GetBytes(jwtKey);
            var tokenHandler = new JwtSecurityTokenHandler();

            // 🔹 Token oluşturma
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToLower()) // ✅ Rol küçük harf
                }),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpireMinutes"] ?? "60")),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                message = "Giriş başarılı!",
                token = tokenString,
                role = user.Role,
                id = user.Id,
                fullName = user.FullName
            });
        }

        // 🔹 3️⃣ Otomatik Parent-Student ilişkisi oluşturma metodu
        private async Task CreateParentStudentLinksAsync(User newUser)
        {
            if (newUser.Role == "veli")
            {
                var students = await _context.Users
                    .Where(u => u.Role == "öğrenci")
                    .ToListAsync();

                foreach (var student in students)
                {
                    if (!await _context.ParentStudents
                        .AnyAsync(ps => ps.ParentId == newUser.Id && ps.StudentId == student.Id))
                    {
                        _context.ParentStudents.Add(new ParentStudent
                        {
                            ParentId = newUser.Id,
                            StudentId = student.Id
                        });
                    }
                }
            }
            else if (newUser.Role == "öğrenci")
            {
                var parents = await _context.Users
                    .Where(u => u.Role == "veli")
                    .ToListAsync();

                foreach (var parent in parents)
                {
                    if (!await _context.ParentStudents
                        .AnyAsync(ps => ps.ParentId == parent.Id && ps.StudentId == newUser.Id))
                    {
                        _context.ParentStudents.Add(new ParentStudent
                        {
                            ParentId = parent.Id,
                            StudentId = newUser.Id
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }

    // DTO'lar
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Role { get; set; }
    }
}
