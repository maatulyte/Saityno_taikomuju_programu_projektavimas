using System.ComponentModel.DataAnnotations;

namespace saitynai_backend.Entities
{
    public class Faculty
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public ICollection<Mentor> Mentors { get; set; } = new List<Mentor>();

        [Required]
        public required string UserId { get; set; }
        public User User { get; set; }
    }
}