using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace saitynai_backend.Entities
{
    public class Mentor
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; } 
        public string Email { get; set; }   
        public string PhoneNumber { get; set; }
        public int FacultyId { get; set; }
        public Faculty Faculty { get; set; }
        public StudyLevel StudyLevel { get; set; }
        public string StudyProgram { get; set; }
        public int StudyYear { get; set; }
        [Required]
        public required string UserId { get; set; }
        public User User { get; set; }

        public ICollection<Group> Groups { get; set; } = new List<Group>();

    }
    public enum StudyLevel
    {
        Bachelor = 1,
        Master = 2,
        PhD = 3
    }
}