using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Edulink.Models;

namespace Edulink.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParentController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 1️⃣ Velinin öğrencilerini getir
        [HttpGet("students/{parentId}")]
        public async Task<IActionResult> GetStudents(int parentId)
        {
            var students = await _context.ParentStudents
                .Where(ps => ps.ParentId == parentId && ps.Student != null)
                .Include(ps => ps.Student)
                .Select(ps => new
                {
                    ps.Student!.Id,
                    ps.Student!.FullName,
                    ps.Student!.Email
                })
                .ToListAsync();

            return Ok(new
            {
                message = students.Any() ? " Öğrenciler bulundu." : "Henüz öğrenci atanmadı.",
                students
            });
        }

        // 🔹 2️⃣ Velinin öğrencilerinin teslim ettiği ödevleri getir
        [HttpGet("submissions/{parentId}")]
        public async Task<IActionResult> GetSubmissions(int parentId)
        {
            var submissions = await (
                from ps in _context.ParentStudents
                join s in _context.Submissions on ps.StudentId equals s.UserId
                join a in _context.Assignments on s.AssignmentId equals a.Id
                join u in _context.Users on s.UserId equals u.Id
                where ps.ParentId == parentId
                select new
                {
                    SubmissionId = s.Id,
                    StudentName = u.FullName,
                    AssignmentTitle = a.Title,
                    a.DueDate,
                    s.SubmittedAt,
                    s.Grade
                }
            ).ToListAsync();

            return Ok(new
            {
                message = submissions.Any() ? " Teslimler bulundu." : "Henüz teslim edilen ödev yok.",
                submissions
            });
        }

        // 🔹 3️⃣ Aktif (teslim tarihi geçmemiş) ödevleri getir
        [HttpGet("active-assignments/{studentId}")]
        public async Task<IActionResult> GetActiveAssignments(int studentId)
        {
            var today = DateTime.Now;

            var activeAssignments = await (
                from a in _context.Assignments
                where a.DueDate > today // halen teslim süresi devam eden ödevler
                select new
                {
                    a.Id,
                    a.Title,
                    a.DueDate,
                    a.CourseId
                }
            ).ToListAsync();

            return Ok(new
            {
                message = activeAssignments.Any()
                    ? " Aktif ödevler bulundu."
                    : "Aktif ödev bulunamadı.",
                activeAssignments
            });
        }
    }
}
