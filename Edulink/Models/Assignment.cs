using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Edulink.Models
{
    public class Assignment
    {
        public int Id { get; set; }

        public string? Title { get; set; }          // Ödev başlığı (nullable)
        public string? Description { get; set; }    // Açıklama (nullable)

        [Column(TypeName = "timestamp without time zone")]
        public DateTime DueDate { get; set; }       // Teslim tarihi

        // 🔹 İlişki (her ödev bir derse ait)
        public int CourseId { get; set; }
        public Course? Course { get; set; }          // Navigation property
    }
}
