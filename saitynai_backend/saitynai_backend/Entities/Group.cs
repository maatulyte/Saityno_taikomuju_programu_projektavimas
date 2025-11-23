using System.ComponentModel.DataAnnotations;

namespace saitynai_backend.Entities
{
    public class Group
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public StudyLevel StudyLevel { get; set; }
        public int StudyYear { get; set; }  

        public int MentorId { get; set; }
        public Mentor Mentor { get; set; }

    }
}