namespace Edulink.Models
{
    public class Submission
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AssignmentId { get; set; }

        public string? FileUrl { get; set; }
        public DateTime SubmittedAt { get; set; }

        public int? Grade { get; set; }
        public string? Feedback { get; set; }
        public DateTime? GradedAt { get; set; }

        public User? User { get; set; }
        public Assignment? Assignment { get; set; }
    }
}
