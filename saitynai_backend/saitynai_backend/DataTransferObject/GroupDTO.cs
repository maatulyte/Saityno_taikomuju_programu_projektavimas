using saitynai_backend.Entities;

namespace saitynai_backend.DataTransferObject
{
    public class CreateGroupDTO
    {
        public string Name { get; set; }
        public StudyLevel StudyLevel { get; set; }
        public int StudyYear { get; set; }
        public int MentorId { get; set; }
    }

    public class UpdateGroupDTO
    {
        public string Name { get; set; }
        public StudyLevel StudyLevel { get; set; }
        public int StudyYear { get; set; }
    }

    public class ResponseGroupDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public StudyLevel StudyLevel { get; set; }
        public int StudyYear { get; set; }
        public int MentorId { get; set; }
    }
}