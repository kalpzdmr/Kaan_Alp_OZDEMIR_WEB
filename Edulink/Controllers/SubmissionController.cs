using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Edulink.Models;

namespace Edulink.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubmissionController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ 1️⃣ Tüm teslimleri getir (öğretmen paneli için)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var submissions = await _context.Submissions
                .Include(s => s.User)
                .Include(s => s.Assignment)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            if (!submissions.Any())
                return Ok(new { message = "Henüz teslim yapılmadı.", submissions = new List<Submission>() });

            return Ok(submissions);
        }

        // ✅ 2️⃣ Belirli öğrencinin teslimleri
        [HttpGet("mine/{userId}")]
        public async Task<IActionResult> GetMine(int userId)
        {
            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            if (!submissions.Any())
                return Ok(new { message = "Henüz ödev teslimin bulunmuyor.", submissions = new List<Submission>() });

            return Ok(submissions);
        }

        // ✅ 3️⃣ Sade teslim kaydı (ödev seçildiğinde “teslim edildi” olarak işaretler)
        [HttpPost("simple")]
        public async Task<IActionResult> AddSimple([FromBody] SubmissionDto dto)
        {
            if (dto == null)
                return BadRequest("Geçersiz teslim verisi!");

            bool assignmentExists = await _context.Assignments.AnyAsync(a => a.Id == dto.AssignmentId);
            if (!assignmentExists)
                return BadRequest("Seçilen ödev bulunamadı!");

            bool alreadySubmitted = await _context.Submissions.AnyAsync(s =>
                s.UserId == dto.UserId && s.AssignmentId == dto.AssignmentId);

            if (alreadySubmitted)
                return Conflict("Bu ödev zaten teslim edilmiş.");

            var submission = new Submission
            {
                UserId = dto.UserId,
                AssignmentId = dto.AssignmentId,
                FileUrl = null,
                SubmittedAt = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified)

            };

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = " Ödev teslim edildi (işaretlendi)!",
                submission
            });
        }

        // ✅ 4️⃣ Öğretmen not verir
        [HttpPut("{id}/grade")]
        public async Task<IActionResult> Grade(int id, [FromBody] Submission update)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
                return NotFound("Teslim bulunamadı!");

            if (update.Grade is < 0 or > 100)
                return BadRequest("Geçersiz not değeri! 0-100 arası olmalı.");

            submission.Grade = update.Grade;
            submission.Feedback = update.Feedback ?? "";
            submission.GradedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Notlandırma başarıyla kaydedildi!",
                submission
            });
        }
    }
}
