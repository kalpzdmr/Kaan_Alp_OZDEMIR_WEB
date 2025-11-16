namespace Edulink.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // Varsayılan rol öğrenci
        public string Role { get; set; } = "öğrenci";

        // 🔹 Navigation properties
        public ICollection<Submission>? Submissions { get; set; }
        public ICollection<ParentStudent>? ParentLinks { get; set; }
        public ICollection<ParentStudent>? StudentLinks { get; set; }
    }
}
