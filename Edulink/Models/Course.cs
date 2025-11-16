namespace Edulink.Models
{
    public class Course
    {
        public int Id { get; set; }

        public string? Name { get; set; }          // Ders adı
        public string? Description { get; set; }   // Ders açıklaması
        public string? Teacher { get; set; }       // Dersi veren öğretmen
    }
}
