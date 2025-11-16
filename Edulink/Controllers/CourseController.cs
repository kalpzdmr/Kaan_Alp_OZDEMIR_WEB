using Edulink;
using Edulink.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Edulink.Controllers
{
    [Authorize] // 🔒 Giriş yapılmış kullanıcı zorunlu
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CourseController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Tüm dersleri listele (her kullanıcı görebilir)
        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _context.Courses.ToListAsync();
            return Ok(courses);
        }

        // 🔹 Sadece öğretmen ders ekleyebilir
        [Authorize(Roles = "öğretmen")]
        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody] Course course)
        {
            if (course == null)
                return BadRequest("Geçersiz ders verisi!");

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return Ok(" Ders başarıyla eklendi!");
        }

        // 🔹 Sadece öğretmen ders silebilir
        [Authorize(Roles = "öğretmen")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound(" Ders bulunamadı!");

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return Ok(" Ders başarıyla silindi!");
        }
    }
}
