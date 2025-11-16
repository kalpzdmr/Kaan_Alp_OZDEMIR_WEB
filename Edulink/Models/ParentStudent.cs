namespace Edulink.Models
{
    public class ParentStudent
    {
        public int Id { get; set; }

        // 🔹 Foreign Keys
        public int ParentId { get; set; }
        public int StudentId { get; set; }

        // 🔹 Navigation Properties
        public User? Parent { get; set; }
        public User? Student { get; set; }
    }
}
