using saitynai_backend.Entities;

namespace saitynai_backend.DataTransferObject
{
    public class CreateMentorDTO
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public int FacultyId { get; set; }
        public string StudyProgram { get; set; }
    }

    public class UpdateMentorDTO
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public int FacultyId { get; set; }
        public string StudyProgram { get; set; }
    }
}