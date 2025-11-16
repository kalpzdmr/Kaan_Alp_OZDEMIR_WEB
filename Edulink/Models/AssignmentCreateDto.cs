namespace Edulink.Models
{
    public class AssignmentCreateDto
    {
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime DueDate { get; set; }   // React ISO string gönderiyor

        public string CourseName { get; set; } = string.Empty;
    }
}
