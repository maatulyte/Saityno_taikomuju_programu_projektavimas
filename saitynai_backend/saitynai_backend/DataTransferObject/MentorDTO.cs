using saitynai_backend.Entities;
using System.Drawing;

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
        public int StudyYear { get; set; }
        public StudyLevel StudyLevel { get; set; }
    }

    public class UpdateMentorDTO
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public int FacultyId { get; set; }
        public string StudyProgram { get; set; }
        public int StudyYear { get; set; } 
        public StudyLevel StudyLevel { get; set; }  
    }

    public class ResponseMentorDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public int FacultyId { get; set; }
        public string StudyProgram { get; set; }
        public int StudyYear { get; set; }
        public StudyLevel StudyLevel { get; set; }
    }
}