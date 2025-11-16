using Edulink;
using Edulink.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Edulink.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AssignmentController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Tüm ödevleri getir (Course dahil)
        [HttpGet]
        public async Task<IActionResult> GetAssignments()
        {
            var assignments = await _context.Assignments
                .Include(a => a.Course)
                .ToListAsync();

            return Ok(assignments);
        }

        // 🔹 Yeni ödev ekleme (Sadece öğretmen)
        [Authorize(Roles = "öğretmen")]
        [HttpPost]
        public async Task<IActionResult> AddAssignment([FromBody] AssignmentCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Geçersiz ödev verisi!");

            if (string.IsNullOrWhiteSpace(dto.Title) ||
                string.IsNullOrWhiteSpace(dto.CourseName) ||
                dto.DueDate == default)
            {
                return BadRequest("Başlık, ders ve teslim tarihi zorunludur.");
            }

            var normalizedCourseName = dto.CourseName.Trim();

            // 🔍 Ders var mı?
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Name == normalizedCourseName);

            if (course == null)
            {
                return BadRequest($"Bu ders sistemde bulunamadı: {normalizedCourseName}");
            }

            var assignment = new Assignment
            {
                Title = dto.Title.Trim(),
                Description = string.IsNullOrWhiteSpace(dto.Description)
                    ? "Açıklama yok"
                    : dto.Description.Trim(),
                DueDate = dto.DueDate,
                CourseId = course.Id
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Ödev başarıyla eklendi!",
                assignment.Id
            });
        }

        // 🔹 Ödev silme (Sadece öğretmen)
        [Authorize(Roles = "öğretmen")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            var assignment = await _context.Assignments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
                return NotFound("Ödev bulunamadı.");

            // Bu ödeve bağlı teslimleri sil
            var relatedSubmissions = await _context.Submissions
                .Where(s => s.AssignmentId == id)
                .ToListAsync();

            if (relatedSubmissions.Any())
                _context.Submissions.RemoveRange(relatedSubmissions);

            _context.Assignments.Remove(assignment);

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Ödev ve ilişkili teslimler başarıyla silindi.");
            }
            catch (DbUpdateConcurrencyException)
            {
                return BadRequest("Ödev zaten silinmiş veya veritabanında bulunamadı.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }
    }
}
