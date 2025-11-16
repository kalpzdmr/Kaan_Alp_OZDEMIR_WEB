using Edulink.Models;
using Microsoft.EntityFrameworkCore;

namespace Edulink
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // 🔹 Veritabanı Tabloları
        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<ParentStudent> ParentStudents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            /* -------------------------------------------------
             * 🟢 USER (Kullanıcılar)
             * ------------------------------------------------- */
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.Id);

                entity.Property(u => u.FullName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(u => u.Email)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(u => u.Password)
                      .IsRequired()
                      .HasMaxLength(255);

                entity.Property(u => u.Role)
                      .IsRequired()
                      .HasMaxLength(20);

                // 🔹 Navigation ilişkileri
                entity.HasMany(u => u.Submissions)
                      .WithOne(s => s.User)
                      .HasForeignKey(s => s.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.ParentLinks)
                      .WithOne(ps => ps.Parent)
                      .HasForeignKey(ps => ps.ParentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.StudentLinks)
                      .WithOne(ps => ps.Student)
                      .HasForeignKey(ps => ps.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            /* -------------------------------------------------
             * 📘 COURSE (Dersler)
             * ------------------------------------------------- */
            modelBuilder.Entity<Course>(entity =>
            {
                entity.ToTable("Courses");
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Name)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(c => c.Description)
                      .HasMaxLength(300);
            });

            /* -------------------------------------------------
             * 🧾 ASSIGNMENT (Ödevler)
             * ------------------------------------------------- */
            modelBuilder.Entity<Assignment>(entity =>
            {
                entity.ToTable("Assignments");

                entity.Property(a => a.Title)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(a => a.DueDate)
                      .HasColumnType("timestamp without time zone");

                // 🔹 Bir ödev bir derse ait
                entity.HasOne(a => a.Course)
                      .WithMany()
                      .HasForeignKey(a => a.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            /* -------------------------------------------------
             * 📤 SUBMISSION (Ödev Teslimleri)
             * ------------------------------------------------- */
            modelBuilder.Entity<Submission>(entity =>
            {
                entity.ToTable("Submissions");

                entity.Property(s => s.SubmittedAt)
                      .HasColumnType("timestamp without time zone");

                entity.HasOne(s => s.Assignment)
                      .WithMany()
                      .HasForeignKey(s => s.AssignmentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(s => s.User)
                      .WithMany(u => u.Submissions)
                      .HasForeignKey(s => s.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            /* -------------------------------------------------
             * 👨‍👩‍👧 PARENT-STUDENT (Veli - Öğrenci İlişkisi)
             * ------------------------------------------------- */
            modelBuilder.Entity<ParentStudent>(entity =>
            {
                entity.ToTable("ParentStudents");
                entity.HasKey(ps => ps.Id);

                entity.HasOne(ps => ps.Parent)
                      .WithMany(u => u.ParentLinks)
                      .HasForeignKey(ps => ps.ParentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ps => ps.Student)
                      .WithMany(u => u.StudentLinks)
                      .HasForeignKey(ps => ps.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);

                // 🔹 Aynı veli-öğrenci çifti tekrar eklenemez
                entity.HasIndex(ps => new { ps.ParentId, ps.StudentId })
                      .IsUnique();
            });
        }
    }
}
