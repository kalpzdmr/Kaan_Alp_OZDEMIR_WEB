namespace Edulink.Models
{
    public class SubmissionDto
    {
        public int UserId { get; set; }
        public int AssignmentId { get; set; }
        public string? FileUrl { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
